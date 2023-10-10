export const fix = {
    errorDone: function(error){if(error.response && error.response.statusCode === 400 || error.response && error.response.statusCode === 403){}},
    textHello: 'Добрый день!',
    textCallInfo: 'Напиши модель своего аппарата, что бы узнать ориентировочную стоимость ремонта или замены деталей',
    textHistoryRequest: `История моих запросов`
}