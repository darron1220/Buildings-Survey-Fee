document.addEventListener('DOMContentLoaded', () => {
  const caseTypeSelect = document.getElementById('case-type');
  const districtSelect = document.getElementById('district');
  const sectionSelect = document.getElementById('section');

  const sectionMapping = {
    "新園段": { file: "2802_Luzhu_Xinyuan_data.json", code: 2802 },
    "中華段": { file: "2833_Luzhu_Zhonghua_data.json", code: 2833 }
  };

  fetch('./district_data.json')
    .then(response => response.json())
    .then(data => {
      for (const district in data) {
        const option = document.createElement('option');
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
      }

      districtSelect.addEventListener('change', () => {
        const selectedDistrict = districtSelect.value;
        sectionSelect.innerHTML = '<option value="">請選擇地段</option>';
        if (selectedDistrict && data[selectedDistrict]) {
          data[selectedDistrict].forEach(section => {
            const option = document.createElement('option');
            option.value = section;
            option.textContent = section;
            sectionSelect.appendChild(option);
          });
          sectionSelect.disabled = false;
        } else {
          sectionSelect.disabled = true;
        }
      });
    })
    .catch(error => console.error('行政區資料讀取錯誤：', error));

  caseTypeSelect.addEventListener('change', () => {
    const buildingFields = document.getElementById('building-fields');
    if (["建物第一次測量", "建物複丈"].includes(caseTypeSelect.value)) {
      buildingFields.style.display = 'block';
    } else {
      buildingFields.style.display = 'none';
    }
  });
});

  document.getElementById('land-form').addEventListener('submit', (event) => {
    event.preventDefault();

    const district = document.getElementById('district').value;
    const section = document.getElementById('section').value;
    const landNumber = document.getElementById('land-number').value.trim();
    const caseType = caseTypeSelect.value;
    const buildingNumbers = Number(document.getElementById('building-numbers').value) || 0;
    const hasDigitalFile = document.getElementById('has-digital-file').value;

    if (!district || !section || !landNumber || !caseType) {
      document.getElementById('result-text').innerHTML = "請完整填寫所有必填欄位。";
      document.getElementById('result').style.display = "block";
      return;
    }

    const mapping = sectionMapping[section];
    if (!mapping) {
      document.getElementById('result-text').innerHTML = "目前僅支援新園段與中華段查詢。";
      document.getElementById('result').style.display = "block";
      return;
    }

    fetch(`./${mapping.file}`)
      .then(response => response.json())
      .then(data => {
        const landData = data.find(item => Number(item.地段) === mapping.code && Number(item.地號) === Number(landNumber));
        if (!landData) {
          document.getElementById('result-text').innerHTML = "未找到該地號的資料";
          document.getElementById('result').style.display = "block";
          return;
        }

        const area = landData.登記面積 || landData.面積;
        const units = Math.ceil(area / 50); // 每單位50平方公尺計算

        fetch('./fee_standards.json')
          .then(response => response.json())
          .then(feeData => {
            const feeStandard = feeData.find(item => item["案件類型"] === caseType);
            if (!feeStandard) {
              throw new Error('費用資料讀取錯誤');
            }

            let totalFee = 0;

            if (caseType === '建物第一次測量') {
              totalFee += feeStandard.費用明細.建物平面圖測量費.單價 * units;
              totalFee += feeStandard.費用明細.建物測量轉繪費 * buildingNumbers;
              totalFee += feeStandard["費用明細"]["位置圖測量費"];
              totalFee += feeStandard["費用明細"]["建物位置圖轉繪費"] * buildingNumbers;
              totalFee += feeStandard["費用明細"]["建物平面圖轉繪費"] * buildingNumbers;
              totalFee += feeStandard["費用明細"]["建物測量成果圖校對費"] * buildingNumbers;
            } else if (caseType === '建物複丈') {
              totalFee += feeStandard["費用明細"]["建物合併複丈費"] * buildingNumbers;
              totalFee += feeStandard["費用明細"]["建物分割複丈費"]["每單位面積費用"] * units;
              totalFee += feeStandard["費用明細"]["建物分割複丈費"]["建物轉繪費"] * buildingNumbers;
              totalFee += feeStandard["費用明細"]["建物部分滅失測量費"] * units;
              totalFee += feeStandard["費用明細"]["建物部分滅失轉繪費"] * buildingNumbers;
              totalFee += feeStandard["費用明細"]["建物基地號門牌號及全部滅失勘查費"] * buildingNumbers;
              totalFee += feeStandard["費用明細"]["建物合併轉繪費"] * buildingNumbers;
            }

            if (document.getElementById('has-digital-file').value === 'no') {
              totalFee += feeStandard["費用明細"]["數值化作業費"] * buildingNumbers;
            }

            document.getElementById('result-text').innerHTML = `總費用：${totalFee}元`;
            document.getElementById('result').style.display = "block";
          })
          .catch(error => {
            document.getElementById('result-text').innerHTML = error.message;
            document.getElementById('result').style.display = "block";
          });
      })
      .catch(error => {
        console.error('Error:', error);
        document.getElementById('result-text').innerHTML = "資料讀取錯誤";
        document.getElementById('result').style.display = "block";
      });
});
