import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

const SECRET_KEY = process.env.SECRET_KEY || 'meu-secreto';

export async function register(req, res) {
  const { username, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      username,
      password: hashedPassword,
      role: role || 'user'
    });
    res.status(201).json({ message: "Usuário registrado com sucesso" });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Usuário já existe' });
    }
    res.status(500).json({ message: 'Erro ao registrar usuário' });
  }
}

export async function login(req, res) {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });

  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      SECRET_KEY,
      { expiresIn: '2h' }
    );
    res.status(201).json({ token });
  } else {
    res.status(401).json({ message: 'Credenciais inválidas' });
  }
}

export function protectedRoute(req, res) {
  res.status(200).json({ message: 'Acesso autorizado à rota protegida', user: req.user });
}

export function adminRoute(req, res) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado: requer privilégio de administrador' });
  }
  res.status(200).json({ message: 'Acesso autorizado à rota de administrador', user: req.user });
}
