document.addEventListener('DOMContentLoaded', () => {
  const districtSelect = document.getElementById('district');
  const sectionSelect = document.getElementById('section');
  const landNumberInput = document.getElementById('land-number');
  const caseTypeSelect = document.getElementById('case-type');
  const detailTypeSelect = document.getElementById('detail-type');
  const detailField = document.getElementById('detail-field');
  const dynamicInputs = document.getElementById('dynamic-inputs');
  const resultText = document.getElementById('result-text');

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
    });

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
        <option value="建物部分滅失">建物部分滅失</option>
        <option value="建物基地號或建物門牌號勘查">建物基地號或建物門牌號勘查</option>
        <option value="建物或特別建物各棟次之全部滅失勘查">建物或特別建物各棟次之全部滅失勘查</option>`;
      detailField.style.display = 'block';
    } else {
      detailField.style.display = 'none';
    }
  });

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
    } else if(["建物合併", "建物分割", "建物部分滅失"].includes(detailTypeSelect.value)){
      dynamicInputs.innerHTML = `
        <label>費用類型：</label>
        <select id="fee-type" required>
          <option value="">請選擇</option>
          <option value="複丈費">複丈費</option>
          <option value="轉繪費">轉繪費</option>
        </select>
        <label>棟數：</label>
        <input type="number" id="building-numbers" min="1" required>`;
    } else {
      dynamicInputs.innerHTML = `
        <label>棟數：</label>
        <input type="number" id="building-numbers" min="1" required>`;
    }
  });

  document.getElementById('land-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const landNumber = landNumberInput.value.trim();
    if (!/^\d{8}$/.test(landNumber)) {
      alert('地號需為8位數字格式，例如02440000');
      return;
    }

    const caseType = caseTypeSelect.value;
    const detailType = detailTypeSelect.value;

    fetch('./fee_standards.json').then(res => res.json()).then(fees => {
      const feeStandard = fees.find(item => item.案件類型 === caseType).費用明細;
      let totalFee = 0;

      if (caseType === '建物第一次測量') {
        if (detailType === "282") {
          totalFee += feeStandard.位置圖測量費 * Number(document.getElementById('pos-map-count').value);
          totalFee += feeStandard.建物平面圖測量費 * Number(document.getElementById('floor-map-count').value);
        } else if (detailType === "282-1") {
          totalFee += feeStandard.建物位置圖轉繪費 * Number(document.getElementById('pos-transfer-count').value);
          totalFee += feeStandard.建物平面圖轉繪費 * Number(document.getElementById('plan-transfer-count').value);
        } else if (detailType === "282-2") {
          totalFee += feeStandard.建物測量成果圖校對費 * Number(document.getElementById('check-count').value);
          totalFee += feeStandard.數值化作業費 * Number(document.getElementById('digitize-count').value);
        }
      } else if (caseType === '建物複丈') {
        const buildingNumbers = Number(document.getElementById('building-numbers').value);
        const feeType = document.getElementById('fee-type')?.value;
        const feeMap = {
          "建物合併": 400,
          "建物分割": feeType === '複丈費' ? 1000 : 800,
          "建物部分滅失": feeType === '複丈費' ? 1000 : 800,
          "建物基地號或建物門牌號勘查": 500,
          "建物或特別建物各棟次之全部滅失勘查": 500
        };
        totalFee += feeMap[detailType] * buildingNumbers;
      }

      resultText.textContent = `總費用為：${totalFee}元`;
      document.getElementById('result').style.display = 'block';
    });
  });
});
