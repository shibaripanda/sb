export const dateAndTime = () => {
    const time = new Date()
    let month = Number(time.getMonth() + 1)
    let day = time.getDate()
    let minutes = time.getMinutes()
    let hour = time.getHours()

    if(String(month).length == 1){
        month = '0' + month
    }
    if(String(day).length == 1){
        day = '0' + day
    }
    if(String(minutes).length == 1){
        minutes = `0${minutes}`
    }
    if(String(hour).length == 1){
        hour = '0' + hour
    }

    return day + '.' + month + '.' + time.getFullYear() + ' ' + hour + ':' + minutes
}