export const fix = {
    errorDone: function(error){if(error.response && error.response.statusCode === 400 || error.response && error.response.statusCode === 403){}},
    textHello: 'Добрый день!',
    textCallInfo: 'Напиши модель своего аппарата, что бы узнать ориентировочную стоимость ремонта или замены деталей',
    textHistoryRequest: `История моих запросов`,
    textNoResult: 'Ничего не найдено, попробуйте изменить текст запроса',
    modelsDevicesTel: [
        {name:'Huawei', text: 'huawei'},
        {name:'Xiaomi', text: 'xiaomi'},
        {name:'Iphone', text: 'iphone'},
        {name:'Samsung', text: 'samsung'},
        {name:'Realme', text: 'realme'},
        {name:'Honor', text: 'honor'},
        {name:'Nokia', text: 'nokia'},
        {name:'Vivo', text: 'vivo'},
        {name:'ZTE', text: 'zte'}
    ]
}