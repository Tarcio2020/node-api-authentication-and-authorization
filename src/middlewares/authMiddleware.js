import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET;

export default function authenticateJWT(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1] || req.query.token;

    if (!token) {
        return res.status(401).json({ message: 'Token de autenticação não fornecido' });
    }

    if (!SECRET_KEY) {
        console.error('Erro: JWT_SECRET não configurado');
        return res.status(500).json({ message: 'Erro de configuração do servidor' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            console.error('Erro na verificação do token:', err);
            return res.status(403).json({ message: 'Token inválido ou expirado' });
        }

        if (decoded.action === 'password_reset') {
            return res.status(403).json({ message: 'Este token é apenas para reset de senha' });
        }

        req.user = decoded;
        next();
    });
}