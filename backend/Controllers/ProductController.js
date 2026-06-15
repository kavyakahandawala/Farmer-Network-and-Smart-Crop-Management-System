const Product = require('../Model/ProductModel');

exports.getAllProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    let query = {};
    if (search) query.productname = { $regex: search, $options: 'i' };
    if (category) query.category = category;
    let products = await Product.find(query);
    if (sort === 'asc') products = products.sort((a, b) => a.price - b.price);
    if (sort === 'desc') products = products.sort((a, b) => b.price - a.price);
    console.log('Fetched products:', products); // Debug log
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products', error });
  }
};

exports.addProduct = async (req, res) => {
  try {
    console.log('Request body:', req.body); // Debug log
    console.log('Uploaded file:', req.file); // Debug log
    const product = new Product({
      productname: req.body.productname,
      category: req.body.category,
      quantity: Number(req.body.quantity),
      price: Number(req.body.price),
      supplier: req.body.supplier,
      description: req.body.description || '', // Ensure description is included
      image: req.file ? `/Uploads/${req.file.filename}` : '' // Ensure image is included
    });
    await product.save();
    console.log('Saved product:', product); // Debug log
    res.status(201).json(product);
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(400).json({ message: 'Error adding product', error });
  }
};

exports.getById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Error fetching product', error });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    Object.assign(product, req.body);
    if (req.file) {
      product.image = `/Uploads/${req.file.filename}`;
    }
    await product.save();
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({ message: 'Error updating product', error });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product', error });
  }
};