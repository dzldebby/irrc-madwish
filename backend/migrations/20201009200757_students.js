const { tableStudents } = require('../src/models/student')


exports.up = (knex) => {
  return knex.schema.createTable(tableStudents, (table) => {
    table.increments('StudentID').primary() 
    table.text('PhoneNumber').notNullable().unique()  // ToDO Discuss how to ensure students are unique
    table.text('FirstName').notNullable()
    table.text('LastName').notNullable()
    table.text('Source')
    table.integer('NativeLanguageID').references('NativeLanguageID').inTable('nativeLanguages').onDelete('CASCADE')
    table.enu('EnglishProficiency', [
      "No",
      "Little",
      "Simple",
      "Intermediate"
    ])
    table.text('Notes')
    table.integer('StatusID').references('StatusID').inTable('statuses').onDelete("CASCADE")
    table.timestamps(true, true)
  })
}

exports.down = (knex) => {
  return knex.schema.dropTable(tableStudents)
}