export const fix = {
    errorDone: function(error){if(error.response && error.response.statusCode === 400 || error.response && error.response.statusCode === 403){}},
    textHello: 'Добрый день!',
    textBack: 'Назад',
    border: '🚧🚧🚧🚧🚧🚧🚧🚧🚧',
    inCart: 'В корзину',
    textCallInfo: 'Я помогу подобрать батарею к телефону!',
    textHistoryRequest: `История моих запросов`,
    textNoResult: 'Ничего не найдено, попробуйте изменить текст запроса или вернитесь назад',
    textCheckModel: 'Выбери модель телефона',
    textModelTel: 'Отправь модель телефона\n(примеры: Redmi Note 4, G900S, M5)\n или вернись назад к главному меню',
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
    ],
    mainMenuButtons: [
        {name:'Заказать батарею к телефону', text: 'accumOrder'},
        // {name:'Заказать экран к телефону', text: 'displayOrder'},
        // {name:'Отремонтировать телефон/ноутбук/планшет', text: 'serviceOrder'},
        // {name:'Realme', text: 'realme'},
        // {name:'Honor', text: 'honor'},
        // {name:'Nokia', text: 'nokia'},
        // {name:'Vivo', text: 'vivo'},
        // {name:'ZTE', text: 'zte'}
    ]

}