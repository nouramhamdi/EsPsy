const Test = require('../Models/testModel');

// Récupérer tous les tests
const getAllTests = async (req, res) => {
    try {
      console.log('Fetching all tests');
      const tests = await Test.find();
      console.log('Fetched tests:', tests);
      res.json(tests);
    } catch (error) {
      console.error('Error fetching tests:', error);
      res.status(500).json({ message: 'Erreur serveur', error });
    }
  };
  
// Récupérer un test par ID
const getTestById = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ message: 'Test non trouvé' });
    res.json(test);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Ajouter un test
const createTest = async (req, res) => {
  try {
    const newTest = new Test(req.body);
    const savedTest = await newTest.save();
    res.status(201).json(savedTest);
  } catch (error) {
    res.status(400).json({ message: 'Données invalides', error });
  }
};

// Mettre à jour un test
const updateTest = async (req, res) => {
  try {
    const updatedTest = await Test.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedTest) return res.status(404).json({ message: 'Test non trouvé' });
    res.json(updatedTest);
  } catch (error) {
    res.status(400).json({ message: 'Données invalides', error });
  }
};

// Supprimer un test
const deleteTest = async (req, res) => {
  try {
    const deletedTest = await Test.findByIdAndDelete(req.params.id);
    if (!deletedTest) return res.status(404).json({ message: 'Test non trouvé' });
    res.json({ message: 'Test supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

module.exports = {
  getAllTests,
  getTestById,
  createTest,
  updateTest,
  deleteTest,
};
