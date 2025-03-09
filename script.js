document.addEventListener('DOMContentLoaded', () => {
  const caseTypeSelect = document.getElementById('case-type');
  const districtSelect = document.getElementById('district');
  const sectionSelect = document.getElementById('section');
  const detailTypeSelect = document.getElementById('detail-type');
  const buildingFields = document.getElementById('building-fields');

  const sectionMapping = {
    "新園段": { file: "2802_Luzhu_Xinyuan_data.json", code: 2802 },
    "中華段": { file: "2833_Luzhu_Zhonghua_data.json", code: 2833 }
  };

  // 載入行政區與地段
  fetch('./district_data.json').then(res=>res.json()).then(data=>{
    for(const district in data){
      districtSelect.add(new Option(district, district));
    }
    districtSelect.addEventListener('change',()=>{
      sectionSelect.innerHTML='<option value="">請選擇地段</option>';
      data[districtSelect.value]?.forEach(sec=>{
        sectionSelect.add(new Option(sec, sec));
      });
      sectionSelect.disabled=!districtSelect.value;
    });
  });

  // 根據案件類型顯示細項選單
  caseTypeSelect.addEventListener('change', () => {
    detailTypeSelect.innerHTML='<option value="">請選擇詳細項目</option>';

    if(caseTypeSelect.value==='建物第一次測量'){
      detailTypeSelect.innerHTML+=`
        <option value="位置圖測量(282)">位置圖測量(依282條)</option>
        <option value="平面圖測量(282)">平面圖測量(依282條)</option>
        <option value="位置圖轉繪(282-1)">位置圖轉繪(依282-1條)</option>
        <option value="平面圖轉繪(282-1)">平面圖轉繪(依282-1條)</option>
        <option value="成果圖核對(282-2)">成果圖核對(依282-2條)</option>
        <option value="數值化作業費(282-2)">數值化作業費(依282-2條)</option>`;
      buildingFields.style.display='block';
    }else if(caseTypeSelect.value==='建物複丈'){
      detailTypeSelect.innerHTML+=`
        <option value="合併複丈">建物合併 - 複丈</option>
        <option value="合併轉繪">建物合併 - 轉繪</option>
        <option value="分割複丈">建物分割 - 複丈</option>
        <option value="分割轉繪">建物分割 - 轉繪</option>
        <option value="部分滅失測量">建物部分滅失 - 測量</option>
        <option value="部分滅失轉繪">建物部分滅失 - 轉繪</option>
        <option value="基地門牌號勘查">建物基地號或門牌號勘查</option>
        <option value="全部滅失勘查">建物全部滅失勘查</option>`;
      buildingFields.style.display='block';
    }else{
      buildingFields.style.display='none';
    }
  });

  // 表單提交與費用計算
  document.getElementById('land-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const district = districtSelect.value;
    const section = sectionSelect.value;
    const landNumber = document.getElementById('land-number').value.trim();
    const caseType = caseTypeSelect.value;
    const detailType = detailTypeSelect.value;
    const buildingNumbers = Number(document.getElementById('building-numbers').value)||0;
    const hasDigitalFile = document.getElementById('has-digital-file').value;

    if(!district||!section||!landNumber||!caseType||!detailType){
      alert('請完整填寫所有必填欄位');
      return;
    }

    const mapping=sectionMapping[section];
    fetch(`./${mapping.file}`).then(res=>res.json()).then(data=>{
      const landData=data.find(item=>
        item.地段.toString()===mapping.code.toString()&&item.地號===landNumber);
      if(!landData){
        alert('未找到該地號資料');
        return;
      }
      const area=Number(landData.登記面積||landData.面積);
      const units=Math.ceil(area/50);

      fetch('./fee_standards.json').then(res=>res.json()).then(feeData=>{
        const feeStandard=feeData.find(item=>item.案件類型===caseType);
        let totalFee=0;

        if(caseType==='建物第一次測量'){
          if(detailType.includes('位置圖測量')) totalFee+=feeStandard.費用明細.位置圖測量費;
          if(detailType.includes('平面圖測量')) totalFee+=feeStandard.費用明細.建物平面圖測量費.單價*units;
          if(detailType.includes('位置圖轉繪')) totalFee+=feeStandard.費用明細.建物位置圖轉繪費*buildingNumbers;
          if(detailType.includes('平面圖轉繪')) totalFee+=feeStandard.費用明細.建物平面圖轉繪費*buildingNumbers;
          if(detailType.includes('成果圖核對')) totalFee+=feeStandard.費用明細.建物測量成果圖校對費*buildingNumbers;
          if(detailType.includes('數值化作業費')||hasDigitalFile==='no') 
              totalFee+=feeStandard.費用明細.數值化作業費*buildingNumbers;
        }else if(caseType==='建物複丈'){
          if(detailType==='合併複丈') totalFee+=feeStandard.費用明細.建物合併複丈費*buildingNumbers;
          if(detailType==='合併轉繪') totalFee+=feeStandard.費用明細.建物合併轉繪費*buildingNumbers;
          if(detailType==='分割複丈') totalFee+=feeStandard.費用明細.建物分割複丈費.每單位面積費用*units;
          if(detailType==='分割轉繪') totalFee+=feeStandard.費用明細.建物分割複丈費.建物轉繪費*buildingNumbers;
          if(detailType==='部分滅失測量') totalFee+=feeStandard.費用明細.建物部分滅失測量費*units;
          if(detailType==='部分滅失轉繪') totalFee+=feeStandard.費用明細.建物部分滅失轉繪費*buildingNumbers;
          if(detailType==='基地門牌號勘查'||detailType==='全部滅失勘查')
            totalFee+=feeStandard.費用明細.建物基地號門牌號及全部滅失勘查費*buildingNumbers;
        }
        document.getElementById('result-text').innerHTML=`總費用：${totalFee}元`;
        document.getElementById('result').style.display='block';
      });
    }).catch(err=>alert('發生錯誤：'+err.message));
  });
});
