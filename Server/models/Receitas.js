import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Receita = sequelize.define(
  "Receita",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nome_receita: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    funilA: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    funilB: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    funilC: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    funilD: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Nomes dos ingredientes
    ingredienteA: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ingredienteB: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ingredienteC: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ingredienteD: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    percentualA: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    percentualB: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    percentualC: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    percentualD: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // Corrigindo os campos de Gramatura para o formato "0,000"
    gramaturaA: {
      type: DataTypes.DECIMAL(4, 3),
      allowNull: true,
    },
    gramaturaB: {
      type: DataTypes.DECIMAL(4, 3),
      allowNull: true,
    },
    gramaturaC: {
      type: DataTypes.DECIMAL(4, 3),
      allowNull: true,
    },
    gramaturaD: {
      type: DataTypes.DECIMAL(4, 3),
      allowNull: true,
    },
  },
  {
    tableName: "receitas",
    timestamps: false,
  }
);

export default Receita;
