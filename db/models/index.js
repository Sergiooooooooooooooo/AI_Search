import { defineUsers } from './users.model.js'

export function defineModels(sequelize){
    defineUsers(sequelize)
}