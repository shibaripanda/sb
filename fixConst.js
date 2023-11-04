import { dateAndTime } from "./modules/dateTime.js"

export const fix = {
    errorDone: function(error){if(error.response && error.response.statusCode === 400 || error.response && error.response.statusCode === 403){}},
    textHello: 'Привет',
    textBack: 'Назад',
    border: '🚧🚧🚧🚧🚧🚧🚧🚧🚧',
    inCart: 'В корзину',
    сart: 'Корзина',
    emptyCart: 'Корзина пуста',
    order: 'Оформить лот',
    menu: 'Меню',
    arhiv: 'Архив',
    look: 'Посмотреть',
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
        {name:'ZTE', text: 'zte'},
        {name:'Sony', text: 'sony'}
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
    ],
    askTextInfo:{
        surname:'Введите вашу фамилию',
        name:'Введите ваше имя',
        lastname:'Введите ваше отчество',
        tel:'Введите ваш номер телефона',
        email:'Введите ваш email',
        evropochta:'Введите номер отделения вашей Европочты',
    },
    statusOrder:{
        status_1:'Создан',
        status_2:'Принят в обработку',
        status_3:'Отправлен',
        status_4:'Ждет на почте',
        status_5:'Получен ✅',
        status_6:'Не востребован ❌',
        status_7:'Отменен продавцом ❗️',
        status_8:'Отменен покупателем ❌'
    },
    

}