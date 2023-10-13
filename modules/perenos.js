export const perenos = async (text) => {
   return await text.replace(/,/g,'\n')
}
