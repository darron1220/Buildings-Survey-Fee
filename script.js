document.addEventListener('DOMContentLoaded', () => {
  const caseTypeSelect = document.getElementById('case-type');
  const buildingFields = document.getElementById('building-fields');
  const districtSelect = document.getElementById('district');
  const sectionSelect = document.getElementById('section');
  const landNumberInput = document.getElementById('land-number');

  const sectionMapping = {
    "新園段": { file: "2802_Luzhu_Xinyuan_data.json", code: 2802 },
    "中華段": { file: "2833_Luzhu_Zhonghua_data.json", code: 2833 }
  };

  caseTypeSelect.addEventListener('change', () => {
    buildingFields.style.display = ['建物第一次測量', '建物複丈'].includes(caseTypeSelect.value) ? 'block' : 'none';
  });

  document.getElementById('land-form').addEventListener('submit', (event) => {
    event.preventDefault();

    const caseType = caseTypeSelect.value;
    const sectionInfo = sectionMapping[sectionSelect.value];
    const landNumber = landNumberInput.value;

    fetch(sectionInfo.file)
      .then(response => response.json())
      .then(landData => {
        const landInfo = landData.find(item => item.地號.toString() === landNumber);
        if (!landInfo) throw new Error('未找到該地號的資料');

        const area = landInfo.登記面積 || landInfo.面積;
        const units = Math.ceil(area / 50);
        const buildingNumbers = Number(document.getElementById('building-numbers').value);
        const hasDigitalFile = document.getElementById('has-digital-file').value === 'yes';

        fetch('fee_standards.json')
          .then(response => response.json())
          .then(data => {
            const standard = data.find(item => item.案件類型 === caseType);
            if (!standard) throw new Error('未找到對應的案件類型');

            let totalFee = 0;
            if (caseType === '建物第一次測量') {
              totalFee = standard.費用明細.建物平面圖測量費 * units
                       + standard.費用明細.建物測量轉繪費
                       + standard.費用明細.位置圖測量費
                       + standard.費用明細.建物位置圖轉繪費 * buildingNumbers
                       + standard.費用明細.建物平面圖轉繪費 * buildingNumbers
                       + standard.費用明細.建物測量成果圖校對費 * buildingNumbers;
            } else if (caseType === '建物複丈') {
              totalFee = standard.費用明細.建物合併複丈費 * buildingNumbers
                       + standard.費用明細.建物合併轉繪費 * buildingNumbers
                       + standard.費用明細.建物分割複丈費 * units
                       + standard.費用明細.建物分割轉繪費 * buildingNumbers
                       + standard.費用明細.建物部分滅失測量費 * units
                       + standard.費用明細.建物部分滅失轉繪費 * buildingNumbers
                       + standard.費用明細.建物基地號門牌號及全部滅失勘查費 * buildingNumbers;
            }

            if (!hasDigitalFile) {
              totalFee += standard.費用明細.數值化作業費 * buildingNumbers;
            }

            document.getElementById('result-text').innerHTML = `總費用：${totalFee}元`;
            document.getElementById('result').style.display = 'block';
          });
      })
      .catch(error => {
        document.getElementById('result-text').innerHTML = error.message;
        document.getElementById('result').style.display = 'block';
      });
  });
});
