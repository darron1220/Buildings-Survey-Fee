document.addEventListener('DOMContentLoaded', () => {
  const districtSelect = document.getElementById('district');
  const sectionSelect = document.getElementById('section');
  const caseTypeSelect = document.getElementById('case-type');
  const detailTypeSelect = document.getElementById('detail-type');
  const detailField = document.getElementById('detail-field');
  const landNumberInput = document.getElementById('land-number');

  // 載入行政區資料並處理選擇事件
  fetch('./district_data.json')
    .then(res => res.json())
    .then(data => {
      Object.keys(data).forEach(district => {
        districtSelect.add(new Option(district, district));
      });

      districtSelect.addEventListener('change', () => {
        sectionSelect.innerHTML = '<option value="">請選擇地段</option>';
        const sections = data[districtSelect.value];
        if (sections) {
          sections.forEach(section => {
            sectionSelect.add(new Option(section, section));
          });
          sectionSelect.disabled = false;
        } else {
          sectionSelect.disabled = true;
        }
      });

  // 案件類型切換時顯示相應的選項
  caseTypeSelect.addEventListener('change', () => {
    detailTypeSelect.innerHTML = '<option value="">請選擇詳細項目</option>';

    if (caseTypeSelect.value === '建物第一次測量') {
      detailTypeSelect.innerHTML = `
        <optgroup label="依地籍測量實施規則第二百八十二條辦理">
          <option value="建物位置圖測量費">建物位置圖測量費</option>
          <option value="建物平面圖測量費">建物平面圖測量費</option>
        </optgroup>
        <optgroup label="依地籍測量實施規則第二百八十二條之一辦理">
          <option value="建物位置圖轉繪費">建物位置圖轉繪費</option>
          <option value="建物平面圖轉繪費">建物平面圖轉繪費</option>
        </optgroup>
        <optgroup label="依地籍測量實施規則第二百八十二條之二辦理">
          <option value="建物測量成果圖核對費">建物測量成果圖核對費</option>
          <option value="建物平面圖及位置圖數值化作業費">建物平面圖及位置圖數值化作業費</option>
        </optgroup>`;
      detailField.style.display = 'block';
    } else if (caseTypeSelect.value === '建物複丈') {
      detailTypeSelect.innerHTML = `
        <option value="建物合併">建物合併</option>
        <option value="建物分割">建物分割</option>
        <option value="建物部分滅失">建物部分滅失</option>`;
      detailField.style.display = 'block';
    } else {
      detailField.style.display = 'none';
    }
  });

  // 地號輸入提示
  landNumberInput.placeholder = "請輸入8位數地號，例如：02440000";

  // 送出表單
  document.getElementById('land-form').addEventListener('submit', e => {
    e.preventDefault();

    const landNumber = landNumberInput.value.trim();
    if (!/^\d{8}$/.test(landNumber)) {
      alert('地號需為8位數字，請重新輸入。');
      return;
    }

    fetch('./fee_standards.json')
      .then(response => response.json())
      .then(fees => {
        const caseType = caseTypeSelect.value;
        const detailType = detailTypeSelect.value;
        const buildingNumbers = parseInt(document.getElementById('building-numbers').value, 10);
        const hasDigitalFile = document.getElementById('has-digital-file').value;
        const needInvestigation = document.getElementById('need-investigation').value;

        let totalFee = 0;
        const feeStandard = fees.find(item => item["案件類型"] === caseType);

        if (feeStandard) {
          if (caseType === '建物第一次測量') {
            if (detailType in feeStandard.費用明細) {
              totalFee += feeStandard.費用明細[detailType] * buildingNumbers;
            }
            if (detailType === "建物位置圖測量費") {
              totalFee = feeStandard.費用明細[detailType]; // 整棟計價
            }
            if (hasDigitalFile === '否') {
              totalFee += feeStandard.費用明細["數值化作業費"] * buildingNumbers;
            }
          } else if (caseType === '建物複丈') {
            totalFee += feeStandard.費用明細[detailType] * buildingNumbers;
            
            if (document.getElementById('need-investigation').value === 'yes') {
              totalFee += feeStandard.費用明細["建物基地號門牌號及全部滅失勘查費"] * buildingNumbers;
            }
          }

          document.getElementById('result-text').innerText = `總費用：${totalFee}元`;
          document.getElementById('result').style.display = "block";
        } else {
          document.getElementById('result-text').innerHTML = "費用資料讀取錯誤";
        }
      })
      .catch(error => {
        console.error('Error:', error);
        document.getElementById('result-text').innerHTML = "資料讀取錯誤";
        document.getElementById('result').style.display = "block";
      });
  });
}); 
