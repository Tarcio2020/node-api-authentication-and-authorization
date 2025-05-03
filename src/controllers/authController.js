import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET;
const PASSWORD_MIN_LENGTH = 8;

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function isStrongPassword(password) {
    return password.length >= PASSWORD_MIN_LENGTH && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /[0-9]/.test(password);
}

export async function register(req, res) {
    const { username, password, role = 'user' } = req.body;

    if (!isValidEmail(username)) {
        return res.status(400).json({ message: 'Por favor, insira um email válido' });
    }

    if (!isStrongPassword(password)) {
        return res.status(400).json({ 
            message: `A senha deve conter no mínimo ${PASSWORD_MIN_LENGTH} caracteres, incluindo letras maiúsculas, minúsculas e números`
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ username, password: hashedPassword, role });
        res.status(201).json({ message: "Usuário registrado com sucesso" });
    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Este email já está cadastrado' });
        }
        console.error('Erro no registro:', err);
        res.status(500).json({ message: 'Erro ao registrar usuário' });
    }
}

export async function login(req, res) {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ where: { username } });
        
        if (!user) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            SECRET_KEY,
            { expiresIn: '2h' }
        );

        res.json({ 
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro durante o login' });
    }
}

export function protectedRoute(req, res) {
    res.json({ 
        message: 'Acesso autorizado',
        user: req.user 
    });
}

export function adminRoute(req, res) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso restrito a administradores' });
    }
    res.json({ 
        message: 'Acesso administrativo autorizado',
        user: req.user
    });
}