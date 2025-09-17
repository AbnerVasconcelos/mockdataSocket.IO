import express from "express";
import Client from "../models/Client.js";

const router = express.Router();

// Criar um novo cliente
router.post("/", async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const newClient = await Client.create({ name, email, phone });
    res.status(201).json(newClient);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar cliente" });
  }
});

// Buscar todos os clientes
router.get("/", async (req, res) => {
  try {
    const clients = await Client.findAll();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar clientes" });
  }
});

export default router;
