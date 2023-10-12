import ExcelJS from 'exceljs'
import { Accum } from "../models/Accum.js"
import { Device } from "../models/Device.js"
import fs  from "fs"

export const upDateBaza = async () => {
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile('./baza/baza1.xlsx')
    workbook.eachSheet(async function(worksheet, sheetId) {

        const sheet = workbook.getWorksheet(worksheet.name)

        // if(worksheet.name.includes('Караоке-микрофоны')){
        if(!worksheet.name.includes('Информация')){
            console.log(worksheet.name)
            for(let i = 3; i < 10000; i++){
                let data
                if(worksheet.name.includes('Аккумуляторы')){
                    data = {
                        rowExist: worksheet.getCell('A' + i).value,
                        model: worksheet.getCell('B' + i).value,
                        price: worksheet.getCell('C' + i).value,
                        exist: worksheet.getCell('E' + i).value
                    }
                }
                else{
                    const imageArray = worksheet.getImages()
                    const image = imageArray.find(item => item.range.tl.nativeRow == i - 1)
                    let path = 'empty' 
                    if(image){
                        const img = workbook.model.media.find(item => item.index === image.imageId)
                        path = `./images/${image.imageId}.${img.extension}`
                        fs.writeFileSync(path, img.buffer)
                    }

                    data = {
                        idProd: worksheet.name,
                        rowExist: worksheet.getCell('A' + i).value,
                        image: path,
                        model: worksheet.getCell('C' + i).value,
                        price: worksheet.getCell('D' + i).value,
                        exist: worksheet.getCell('F' + i).value
                    }
                }
                if(data.rowExist !== null){
                    if(typeof(data.price) == 'number' && data.exist !== 0){
                    
                        let product

                        if(worksheet.name.includes('Аккумуляторы')){
                            product = await Accum.findOne({model: data.model})
                        }
                        else{
                            product = await Device.findOne({model: data.model})
                        }

                        if(product){
                            product.price = data.price
                            await product.save()
                        }
                        else{
                            if(worksheet.name.includes('Аккумуляторы')){
                                product = await Accum({model: data.model, price: data.price})
                            }
                            else{
                                product = await Device({model: data.model, price: data.price, image: data.image, idProd: data.idProd})
                            }
                            await product.save()
                        } 
                    }    
                }
                else{
                    i = 10001
                }
            }
        }
    })
}