const productsAPI = [
  {
    id: 1,
    // Armenian
    title_am: "Փոքր խեցգետին (Մանր)",
    desc_am: "Իդեալական ընտրություն գարեջրի և մեծ ընկերակցության համար։ Չնայած չափսին՝ ունի հարուստ համ և շատ նուրբ միս։",
    // English
    title_en: "Small Crayfish (Snack Size)",
    desc_en: "The perfect companion for a cold beer. Despite their size, these crayfish are packed with flavor and incredibly tender meat.",
    // Russian
    title_ru: "Мелкий рак (Закусочный)",
    desc_ru: "Идеальный выбор под пиво для большой компании. Несмотря на размер, обладают насыщенным вкусом и очень нежным мясом.",
    minWeight: 35,
    maxWeight: 70,
    pricePerKg: 12000,
    images: ["/images/manr-mijin.jpg", "/images/delikates.jpg", "/images/5amsakan.jpg", "/images/delikates.jpg"]
  },
  {
    id: 2,
    title_am: "Միջին խեցգետին (Ստանդարտ)",
    desc_am: "Ամենապոպուլյար չափսը։ Հավասարակշռված համ և մսի առատություն։ Մատուցվում է հատուկ համեմունքներով եփված վիճակում։",
    title_en: "Medium Crayfish (Standard)",
    desc_en: "Our most popular choice. Perfectly balanced size with plenty of meat. Great for family dinners or outdoor parties.",
    title_ru: "Средний рак (Стандарт)",
    desc_ru: "Самый популярный размер. Отличный баланс веса и количества мяса. Идеально подходит для семейного ужина.",
    minWeight: 40,
    maxWeight: 70,
    pricePerKg: 16000,
    images: ["/images/4amsakan.jpg", "/images/5amsakan.jpg", "/images/delikates.jpg", "/images/5amsakan.jpg"]
  },
  {
    id: 3,
    title_am: "Մեծ խեցգետին (Պրեմիում)",
    desc_am: "Ընտրված խոշոր խեցգետիններ՝ նրանց համար, ովքեր գնահատում են մսի որակն ու քանակը։ Իսկական գուրմանների ընտրությունը։",
    title_en: "Large Crayfish (Premium)",
    desc_en: "Selected large crayfish for those who value meat quality and volume. A true choice for seafood lovers and gourmets.",
    title_ru: "Крупный рак (Премиум)",
    desc_ru: "Отборные крупные раки для тех, кто ценит качество и объем мяса. Настоящий выбор истинных гурманов.",
    minWeight: 80,
    maxWeight: 100,
    pricePerKg: 22000,
    images: ["/images/5amsakan.jpg", "/images/crayfish.jpg", "/images/delikates.jpg", "/images/5amsakan.jpg"]
  },
  {
    id: 4,
    title_am: "Էլիտար Դելիկատես (Գիգանտ)",
    desc_am: "Բացառիկ չափսեր և անկրկնելի համ։ Մեր ֆերմայի հպարտությունը։ Այս հսկաները կդառնան ցանկացած սեղանի գլխավոր զարդը։",
    title_en: "Elite Delicacy (Giant)",
    desc_en: "Exceptional size and unforgettable taste. The pride of our farm. These giants will be the centerpiece of any feast.",
    title_ru: "Элитный Деликатес (Гигант)",
    desc_ru: "Исключительный размер и неповторимый вкус. Гордость нашей фермы. Эти гиганты станут главным украшением любого стола.",
    minWeight: 110,
    maxWeight: 150,
    pricePerKg: 30000,
    images: ["/images/4amsakan.jpg", "/images/5amsakan.jpg", "/images/delikates.jpg", "/images/5amsakan.jpg"]
  }
];

export default productsAPI;