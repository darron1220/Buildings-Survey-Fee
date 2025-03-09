document.addEventListener('DOMContentLoaded', () => {
  const districtSelect = document.getElementById('district');
  const sectionSelect = document.getElementById('section');
  const caseTypeSelect = document.getElementById('case-type');
  const detailTypeSelect = document.getElementById('detail-type');
  const detailField = document.getElementById('detail-field');

  fetch('./district_data.json')
    .then(response => response.json())
    .then(data => {
      Object.keys(data).forEach(district => {
        districtSelect.add(new Option(district, district));
      });

      districtSelect.addEventListener('change', () => {
        sectionSelect.innerHTML = '<option value="">請選擇地段</option>';
        if (data[districtSelect.value]) {
          data[districtSelect.value].forEach(section => {
            sectionSelect.add(new Option(section, section));
          });
          sectionSelect.disabled = false;
        } else {
          sectionSelect.disabled = true;
        }
    });

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
  });

  document.getElementById('land-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const landNumber = document.getElementById('land-number').value.trim();

    if (!/^\d{8}$/.test(landNumber)) {
      document.getElementById('result-text').innerHTML = "地號必須為8位數字！";
      document.getElementById('result').style.display = "block";
      return;
    }

    document.getElementById('result-text').innerHTML = "資料格式正確！";
    document.getElementById('result').style.display = "block";
  })
  .catch(error => {
    document.getElementById('result-text').innerHTML = "資料讀取錯誤：" + error;
    document.getElementById('result').style.display = "block";
  });
});
