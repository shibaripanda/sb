import ExcelJS from 'exceljs'
import { Accum } from "../models/Accum.js"
import { Device } from "../models/Device.js"

export const upDateBaza = async () => {
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile('./baza/baza1.xlsx')
    // console.log(await workbook.media)
    
    // const worksheet = workbook.getWorksheet(list)

    workbook.eachSheet(async function(worksheet, sheetId) {

        if(worksheet.name.includes('Караоке-микрофоны')){
            console.log(worksheet._media[0].range)
        }


        
        // const sheet = workbook.getWorksheet(worksheet.name)

        // if(!worksheet.name.includes('Информация')){
        //     console.log(worksheet.name)
        // // console.log(worksheet.name)
        // // console.log(sheetId)
        //     for(let i = 3; i < 10000; i++){
                
        //         console.log(i)
        //         let data
        //         if(worksheet.name.includes('Аккумуляторы')){
        //             data = {
        //                 rowExist: worksheet.getCell('A' + i).value,
        //                 model: worksheet.getCell('B' + i).value,
        //                 price: worksheet.getCell('C' + i).value,
        //                 exist: worksheet.getCell('E' + i).value
        //             }
        //         }
        //         else{
        //             // console.log(worksheet.getCell('B' + i).value)
        //             data = {
        //                 idProd: worksheet.name,
        //                 rowExist: worksheet.getCell('A' + i).value,
        //                 image: worksheet.getCell('B' + i).value,
        //                 model: worksheet.getCell('C' + i).value,
        //                 price: worksheet.getCell('D' + i).value,
        //                 exist: worksheet.getCell('F' + i).value
        //             } 
        //         }
        //         // console.log(data)
        //         if(data.rowExist !== null){
        //             if(typeof(data.price) == 'number' && data.exist !== 0){
                    
        //                 let product

        //                 if(worksheet.name.includes('Аккумуляторы')){
        //                     product = await Accum.findOne({model: data.model})
        //                 }
        //                 else{
        //                     product = await Device.findOne({model: data.model})
        //                 }

        //                 if(product){
        //                     // console.log(data.price)
        //                     product.price = data.price
        //                     // console.log(accum.price)
        //                     await product.save()
        //                 }
        //                 else{
        //                     if(worksheet.name.includes('Аккумуляторы')){
        //                         product = await Accum({model: data.model, price: data.price})
        //                     }
        //                     else{
        //                         product = await Device({model: data.model, price: data.price, image: data.image, idProd: data.idProd})
        //                     }
        //                     await product.save()
        //                 } 
        //             }    
        //         }
        //         else{
        //             i = 10001
        //         }
        //     }
        // }
    })
}