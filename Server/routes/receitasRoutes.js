import express from "express";
import Receita from "../models/Receitas.js";

const router = express.Router();

// Criar uma nova receita
router.post("/", async (req, res) => {
  try {
    const {
      nome_receita,
      funilA,
      funilB,
      funilC,
      funilD,
      ingredienteA,
      ingredienteB,
      ingredienteC,
      ingredienteD,
      percentualA,
      percentualB,
      percentualC,
      percentualD,
      gramaturaA,
      gramaturaB,
      gramaturaC,
      gramaturaD,
    } = req.body;

    const novaReceita = await Receita.create({
      nome_receita,
      funilA,
      funilB,
      funilC,
      funilD,
      ingredienteA,
      ingredienteB,
      ingredienteC,
      ingredienteD,
      percentualA,
      percentualB,
      percentualC,
      percentualD,
      gramaturaA,
      gramaturaB,
      gramaturaC,
      gramaturaD,
    });

    res.status(201).json(novaReceita);
  } catch (error) {
    console.error("Erro ao criar receita:", error);
    res.status(500).json({ error: "Erro ao criar receita" });
  }
});

// Listar todas as receitas
router.get("/", async (req, res) => {
  try {
    const receitas = await Receita.findAll();
    res.json(receitas);
  } catch (error) {
    console.error("Erro ao buscar receitas:", error);
    res.status(500).json({ error: "Erro ao buscar receitas" });
  }
});

// Obter uma receita por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const receita = await Receita.findByPk(id);
    if (receita) {
      res.json(receita);
    } else {
      res.status(404).json({ error: "Receita não encontrada" });
    }
  } catch (error) {
    console.error("Erro ao buscar receita:", error);
    res.status(500).json({ error: "Erro ao buscar receita" });
  }
});

// Atualizar uma receita
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nome_receita,
      funilA,
      funilB,
      funilC,
      funilD,
      ingredienteA,
      ingredienteB,
      ingredienteC,
      ingredienteD,
      percentualA,
      percentualB,
      percentualC,
      percentualD,
      gramaturaA,
      gramaturaB,
      gramaturaC,
      gramaturaD,
    } = req.body;

    const receita = await Receita.findByPk(id);
    if (receita) {
      await receita.update({
        nome_receita,
        funilA,
        funilB,
        funilC,
        funilD,
        ingredienteA,
        ingredienteB,
        ingredienteC,
        ingredienteD,
        percentualA,
        percentualB,
        percentualC,
        percentualD,
        gramaturaA,
        gramaturaB,
        gramaturaC,
        gramaturaD,
      });
      res.json(receita);
    } else {
      res.status(404).json({ error: "Receita não encontrada" });
    }
  } catch (error) {
    console.error("Erro ao atualizar receita:", error);
    res.status(500).json({ error: "Erro ao atualizar receita" });
  }
});

// Deletar uma receita pelo nome
router.delete("/nome/:nome", async (req, res) => {
  try {
    const { nome } = req.params;
    const receita = await Receita.findOne({ where: { nome_receita: nome } });
    if (receita) {
      await receita.destroy();
      res.json({ message: "Receita deletada com sucesso" });
    } else {
      res.status(404).json({ error: "Receita não encontrada" });
    }
  } catch (error) {
    console.error("Erro ao deletar receita:", error);
    res.status(500).json({ error: "Erro ao deletar receita" });
  }
});

export default router;
