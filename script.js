document.addEventListener('DOMContentLoaded', () => {
  const districtSelect = document.getElementById('district');
  const sectionSelect = document.getElementById('section');
  const landNumberInput = document.getElementById('land-number');
  const caseTypeSelect = document.getElementById('case-type');
  const detailTypeSelect = document.getElementById('detail-type');
  const detailField = document.getElementById('detail-field');

  fetch('./district_data.json')
    .then(response => response.json())
    .then(data => {
      // 行政區選項初始化
      for (const district in data) {
        districtSelect.add(new Option(district, district));
      }

      // 選行政區載入地段
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

  // 案件類型選單切換
  const caseTypeSelect = document.getElementById('case-type');
  const detailTypeSelect = document.getElementById('detail-type');
  const detailField = document.getElementById('detail-field');

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
          <option value="數值化作業費">建物平面圖及位置圖數值化作業費</option>
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

  // 表單提交檢查
  document.getElementById('land-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const landNumber = landNumberInput.value.trim();
    if (!/^\d{8}$/.test(landNumber)) {
      document.getElementById('result-text').innerHTML = '地號格式錯誤，應為8位數字，例如：02440000';
      document.getElementById('result').style.display = "block";
      return;
    }

    // 正式計算費用或進一步邏輯應該放這裡
    document.getElementById('result-text').innerHTML = '資料格式正確，待加入費用計算邏輯。';
    document.getElementById('result').style.display = "block";
  });
});
