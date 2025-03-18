document.addEventListener('DOMContentLoaded', () => {
  const districtSelect = document.getElementById('district');
  const sectionSelect = document.getElementById('section');
  const landNumberInput = document.getElementById('land-number');
  const caseTypeSelect = document.getElementById('case-type');
  const detailTypeSelect = document.getElementById('detail-type');
  const detailField = document.getElementById('detail-field');
  const dynamicInputs = document.getElementById('dynamic-inputs');

  fetch('./district_data.json')
    .then(response => response.json())
    .then(data => {
      for (const district in data) {
        districtSelect.add(new Option(district, district));
      }

      districtSelect.addEventListener('change', () => {
        sectionSelect.innerHTML = '<option value="">請選擇地段</option>';
        const selectedDistrict = districtSelect.value;
        if (selectedDistrict && data[selectedDistrict]) {
          data[selectedDistrict].forEach(section => {
            sectionSelect.add(new Option(section, section));
          });
          sectionSelect.disabled = false;
        } else {
          sectionSelect.disabled = true;
        }
      });
    })
    .catch(error => {
      console.error('行政區資料讀取錯誤：', error);
      alert('行政區資料讀取錯誤，請確認district_data.json位置是否正確。');
    });

  // 完整的案件類型選單切換邏輯（更新後）
  caseTypeSelect.addEventListener('change', () => {
    detailTypeSelect.innerHTML = '<option value="">請選擇詳細項目</option>';
    dynamicInputs.innerHTML = '';
    if (caseTypeSelect.value === '建物第一次測量') {
      detailTypeSelect.innerHTML += `
        <option value="282">依地籍測量實施規則第二百八十二條辦理</option>
        <option value="282-1">依地籍測量實施規則第二百八十二條之一辦理</option>
        <option value="282-2">依地籍測量實施規則第二百八十二條之二辦理</option>`;
      detailField.style.display = 'block';
    } else if (caseTypeSelect.value === '建物複丈') {
      detailTypeSelect.innerHTML += `
        <option value="建物合併">建物合併</option>
        <option value="建物分割">建物分割</option>
        <option value="建物部分滅失">建物部分滅失</option>`;
      detailField.style.display = 'block';
    } else {
      detailField.style.display = 'none';
    }
  });

  // 詳細項目選單切換（動態輸入框產生）
  detailTypeSelect.addEventListener('change', () => {
    dynamicInputs.innerHTML = '';
    if (detailTypeSelect.value === '282') {
      dynamicInputs.innerHTML = `
        <label>建物位置圖測繪 (單位數量)：</label>
        <input type="number" id="pos-map-count" min="0" required>
        <label>建物平面圖測繪 (單位數量)：</label>
        <input type="number" id="floor-map-count" min="0" required>`;
    } else if (detailTypeSelect.value === '282-1') {
      dynamicInputs.innerHTML = `
        <label>建物位置圖轉繪 (單位數量)：</label>
        <input type="number" id="pos-transfer-count" min="0" required>
        <label>建物平面圖轉繪 (單位數量)：</label>
        <input type="number" id="plan-transfer-count" min="0" required>`;
    } else if (detailTypeSelect.value === '282-2') {
      dynamicInputs.innerHTML = `
        <label>建物測量成果圖核對 (單位數量)：</label>
        <input type="number" id="check-count" min="0" required>
        <label>建物平面圖及位置圖數值化作業 (單位數量)：</label>
        <input type="number" id="digitize-count" min="0" required>`;
    }
  });

  // 表單提交處理（維持原本邏輯不動）
  document.getElementById('land-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const landNumber = landNumberInput.value.trim();

    if (!/^\d{8}$/.test(landNumber)) {
      alert('地號需為8位數字格式，例如02440000');
      return;
    }

    const district = districtSelect.value;
    const section = sectionSelect.value;
    const caseType = caseTypeSelect.value;
    const detailType = detailTypeSelect.value;
    const buildingNumbers = Number(document.getElementById('building-numbers').value);
    const hasDigitalFile = document.getElementById('has-digital-file').value === 'yes';
    const needInvestigation = document.getElementById('need-investigation').value === 'yes';
    const needLossInvestigation = document.getElementById('need-loss-investigation').value === 'yes';

    let jsonFile = '';
    if (section === "新園段") jsonFile = './2802_Luzhu_Xinyuan_data.json';
    else if (section === "中華段") jsonFile = './2833_Luzhu_Zhonghua_data.json';
    else {
      alert('目前僅支援新園段與中華段查詢。');
      return;
    }

    fetch(jsonFile)
      .then(res => res.json())
      .then(data => {
        const landData = data.find(item => item.地號 === landNumber);

        if (!landData) {
          alert('未找到該地號資料。');
          return;
        }

        const area = landData.登記面積 || landData.面積;
        const units = Math.ceil(area / 50);

        fetch('./fee_standards.json')
          .then(res => res.json())
          .then(fees => {
            const feeStandard = fees.find(item => item.案件類型 === caseType).費用明細;
            let totalFee = 0;

            if (caseType === '建物第一次測量') {
              if (detailTypeSelect.value === "282") {
                totalFee += feeStandard.位置圖測量費 * Number(document.getElementById('pos-map-count').value);
                totalFee += feeStandard.建物平面圖測量費 * Number(document.getElementById('floor-map-count').value);
              } else if (detailTypeSelect.value === "282-1") {
                totalFee += feeStandard.建物位置圖轉繪費 * Number(document.getElementById('pos-transfer-count').value);
                totalFee += feeStandard.建物平面圖轉繪費 * Number(document.getElementById('plan-transfer-count').value);
              } else if (detailTypeSelect.value === "282-2") {
                totalFee += feeStandard.建物測量成果圖校對費 * Number(document.getElementById('check-count').value);
                totalFee += feeStandard.數值化作業費 * Number(document.getElementById('digitize-count').value);
              }
            } else if (caseType === '建物複丈') {
              totalFee += feeStandard["建物合併複丈費"] * buildingNumbers;
              totalFee += feeStandard["建物分割複丈費"] * units;
              totalFee += feeStandard["建物分割轉繪費"] * buildingNumbers;
              totalFee += feeStandard["建物部分滅失測量費"] * units;
              totalFee += feeStandard["建物部分滅失轉繪費"] * buildingNumbers;
              if (needInvestigation) totalFee += feeStandard["建物基地號門牌號及全部滅失勘查費"] * buildingNumbers;
              if (!hasDigitalFile) totalFee += feeStandard["數值化作業費"] * buildingNumbers;
            }

            document.getElementById('result-text').textContent = `總費用為：${totalFee}元`;
            document.getElementById('result').style.display = 'block';
          })
          .catch(err => alert('費用資料讀取錯誤！'));
      })
      .catch(err => {
        alert('地段資料讀取錯誤！');
      });
  });
});
