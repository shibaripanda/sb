import Excel from 'exceljs'
import { Accum } from "../models/Accum.js"

export const excel = async (list) => {
    const workbook = new Excel.Workbook()
    await workbook.xlsx.readFile('./baza/baza1.xlsx')
    
    const worksheet = await workbook.getWorksheet(list)

    for(let i = 1; i < 25; i++){
        const data = {
            model: await worksheet.getCell('B' + i).value,
            price: await worksheet.getCell('C' + i).value
        }

        if(typeof(data.price) == 'number'){
            
            const accum = await Accum.findOne({model: data.model})
            if(accum){
                accum.price = data.price
                await accum.save()
            }
            else{
                const accum = await Accum({model: data.model, price: data.price})
                await accum.save()
            }
        }
    }

    



    // console.log(worksheet.getCell('B300').value)
    // console.log(worksheet.getCell('C300').value)
}