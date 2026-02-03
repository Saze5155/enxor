const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// === Categories ===
exports.getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { articles: true } 
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des catégories" });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, icon } = req.body;
    const category = await prisma.category.create({
      data: { name, icon }
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création de la catégorie" });
  }
};

// === Articles ===
exports.getArticles = async (req, res) => {
  try {
    const { role } = req.user; // From middleware
    const where = {};
    
    // Players filter
    if (role !== 'MJ') {
        where.OR = [
            { visibility: 'PUBLIC' },
            { visibility: 'PARTIAL' },
            { 
               AND: [
                 { visibility: 'TARGETED' },
                 { targets: { some: { id: req.user.userId } } }
               ]
            }
        ];
    }

    const articles = await prisma.article.findMany({
      where,
      include: { 
          category: true, 
          tags: true,
          targets: true // Include targets to show who can see it (for MJ)
      },
      orderBy: { title: 'asc' }
    });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des articles" });
  }
};

exports.getArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.user;
    
    const article = await prisma.article.findUnique({
      where: { id },
      where: { id },
      include: { category: true, tags: true, targets: true }
    });

    if (!article) return res.status(404).json({ message: "Article non trouvé" });

    // Access Control
    if (role !== 'MJ') {
        if (article.visibility === 'DRAFT') return res.status(403).json({ message: "Accès refusé" });
        
        if (article.visibility === 'TARGETED') {
             // Check if user is in targets
             const isTarget = article.targets.some(t => t.id === req.user.userId);
             if (!isTarget) return res.status(403).json({ message: "Accès refusé" });
        }
    }

    // Partial Content Filtering for Players
    if (role !== 'MJ' && article.visibility === 'PARTIAL') {
       // In a real scenario, we would have a 'partialContent' field. 
       // For now, we just prepend a warning or limit content length.
       // article.content = "Contenu Partiel : " + article.content.substring(0, 200) + "...";
    }

    res.json(article);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération de l'article" });
  }
};

exports.createArticle = async (req, res) => {
  try {
    const { title, content, visibility, categoryId, tags } = req.body;
    
    // Prepare tags connection/creation
    const tagConnect = tags ? tags.map(t => ({ where: { name: t }, create: { name: t } })) : [];

    const article = await prisma.article.create({
      data: {
        title,
        content,
        visibility,
        categoryId,
        // Prisma handling for tags would be connectOrCreate usually, but let's simplify for now or handle simple connect
        // tags: { connectOrCreate: tagConnect } 
      }
    });

    res.status(201).json(article);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la création de l'article" });
  }
};

exports.updateArticle = async (req, res) => {
  try {
      const { id } = req.params;
      const { title, content, visibility, categoryId, targets } = req.body;

      // Prepare data object
      const data = { title, content, visibility, categoryId };

      // Handle targets update if provided
      if (targets && Array.isArray(targets)) {
          data.targets = {
              set: targets.map(userId => ({ id: userId })) // Replace existing targets with new list
          };
      }

      const article = await prisma.article.update({
          where: { id },
          data,
          include: { targets: true } // Return updated targets
      });
      res.json(article);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur mise à jour" });
  }
}
