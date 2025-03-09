document.addEventListener('DOMContentLoaded', () => {
  const districtSelect = document.getElementById('district');
  const sectionSelect = document.getElementById('section');
  const caseTypeSelect = document.getElementById('case-type');
  const detailTypeSelect = document.getElementById('detail-type');
  const detailField = document.getElementById('detail-field');
  const landNumberInput = document.getElementById('land-number');

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
    .catch(error => console.error('行政區資料讀取錯誤：', error));

  caseTypeSelect.addEventListener('change', () => {
    detailTypeSelect.innerHTML = '<option value="">請選擇詳細項目</option>';
    if (caseTypeSelect.value === '建物第一次測量') {
      detailTypeSelect.innerHTML += `
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
      detailTypeSelect.innerHTML += `
        <option value="建物合併">建物合併</option>
        <option value="建物分割">建物分割</option>
        <option value="建物部分滅失">建物部分滅失</option>`;
      detailField.style.display = 'block';
    } else {
      detailField.style.display = 'none';
    }
  });

  document.getElementById('land-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const landNumber = landNumberInput.value.trim();
    if (!/^\d{8}$/.test(landNumber)) {
      alert('地號需為8位數字格式，例如02440000');
      return;
    }
    // 後續費用計算邏輯自行補齊...
    alert("資料輸入格式正確！");
  });
});
