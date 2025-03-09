document.addEventListener('DOMContentLoaded', () => {
  const districtSelect = document.getElementById('district');
  const sectionSelect = document.getElementById('section');
  const caseTypeSelect = document.getElementById('case-type');
  const detailTypeSelect = document.getElementById('detail-type');
  const detailField = document.getElementById('detail-field');

  fetch('./district_data.json')
    .then(res => res.json())
    .then(data => {
      for (let district in data) {
        districtSelect.add(new Option(district, district));
      }
      districtSelect.addEventListener('change', () => {
        sectionSelect.innerHTML = '<option value="">請選擇地段</option>';
        data[districtSelect.value]?.forEach(section => {
          sectionSelect.add(new Option(section, section));
        });
      });
    });

  caseTypeSelect.addEventListener('change', () => {
    detailTypeSelect.innerHTML = '';
    detailField.style.display = 'block';

    if (caseTypeSelect.value === '建物第一次測量') {
      detailTypeSelect.innerHTML = `
        <optgroup label="依第282條辦理">
          <option value="位置圖測量費">建物位置圖測量</option>
          <option value="平面圖測量費">建物平面圖測量</option>
        </optgroup>
        <optgroup label="依第282-1條辦理">
          <option value="建物位置圖轉繪費">建物位置圖轉繪費</option>
          <option value="建物平面圖轉繪費">建物平面圖轉繪費</option>
        </optgroup>
        <optgroup label="依第282-2條辦理">
          <option value="建物測量成果圖校對費">建物測量成果圖校對</option>
          <option value="數值化作業費">建物平面圖及位置數值化作業</option>
        </optgroup>`;
    } else if (caseTypeSelect.value === '建物複丈') {
      detailTypeSelect.innerHTML = `
        <option value="建物合併">建物合併（複丈、轉繪）</option>
        <option value="建物分割">建物分割（複丈、轉繪）</option>
        <option value="建物部分滅失">建物部分滅失（測量、轉繪）</option>`;
    } else {
      detailField.style.display = 'none';
    }
  });

  document.getElementById('land-form').addEventListener('submit', e => {
    e.preventDefault();
    const landNumber = document.getElementById('land-number').value.trim();

    if (landNumber.length !== 8 || isNaN(landNumber)) {
      alert('地號必須是8位數字格式，例如02440000');
      return;
    }

    // 取得費用資訊
    fetch('./fee_standards.json')
      .then(res => res.json())
      .then(fees => {
        const selectedFee = fees.find(item => item["案件類型"] === caseTypeSelect.value);
        let cost = 0;

        if (selectedFee) {
          const detail = detailTypeSelect.value;
          if (selectedFee.費用明細[detail]) {
            cost += selectedFee.費用明細[detail];
          } else {
            alert("請正確選擇詳細項目！");
            return;
          }
        }

        alert(`計算總費用為：${cost}元`);
      })
      .catch(err => alert('計算費用時發生錯誤，請稍後重試。'));
  });
});
