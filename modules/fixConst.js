
// import { finData } from "../index.js"
// import { Data } from './models/Data.js'

// finData = await Data.findOne({data: 'data'})
import { Markup } from "telegraf"
console.log(Markup.button)

export const fix = {

    infoCompany: 'ЧСУП "Компьютер и Принтер"\nУНП 191573823\nБеларусь, г. Минск\nул. Лобанка 94, пав 10, ТЦ "MAXIMUS"',
    infoUslugi: '- Ремонт телефонов\n- Ремонт ноутбуков\n- Ремонт планшетов\n- Ремонт мониторов\n- Ремонт телевизоров\n- Ремонт зарядных для ноутбуков',
    infoTelefon: '+375447310419',
    textHello: '<b>Привет, мы мастерская!</b>',

    valut: 'бел.руб.',

    // profit: finData.profit,
    // ship: finData.ship,
    // skv: finData.skv,

    errorDone: function(error){if(error.response && error.response.statusCode === 400 || error.response && error.response.statusCode === 403){}},
    
    textBack: 'Назад',
    border: '🚧🚧🚧🚧🚧🚧🚧🚧🚧',
    inCart: 'В корзину',
    сart: 'Корзина',
    emptyCart: 'Корзина пуста',
    order: 'Оформить доставку',
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
        [Markup.button.callback('Выбрать батарею к телефону', 'accumOrder')],
        // {name:'Заказать батарею к телефону', text: 'accumOrder'},
        [Markup.button.url('Консультация по ремонту', 'https://t.me/XF10_Bot')],
        // {name:'Консультация по ремонту', text: 'displayOrder'},
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
        status_8:'Отменен покупателем ❌',
        status_9:'Запрос гарантии ♻️'
    },
    

}