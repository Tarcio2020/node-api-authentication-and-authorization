import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SECRET_KEY = process.env.JWT_SECRET;
const RESET_TOKEN_EXPIRES_IN = '1h';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function requestPasswordReset(req, res) {
    const { username } = req.body;

    try {
        const user = await User.findOne({ where: { username } });
        
        if (!user) {
            return res.status(200).json({ message: 'Se o email existir, você receberá um link de redefinição' });
        }

        const resetToken = jwt.sign(
            { id: user.id, action: 'password_reset' },
            SECRET_KEY,
            { expiresIn: RESET_TOKEN_EXPIRES_IN }
        );

        const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

        await transporter.sendMail({
            from: `"Suporte" <${process.env.EMAIL_FROM}>`,
            to: user.username,
            subject: 'Redefinição de Senha',
            html: `
                <h2>Redefinição de Senha</h2>
                <p>Clique no link abaixo para redefinir sua senha:</p>
                <a href="${resetUrl}">${resetUrl}</a>
                <p>Este link expirará em 1 hora.</p>
            `,
        });
        console.log(`Token ${resetToken}`);
        res.json({ message: 'Link de redefinição enviado para seu email' });
    } catch (error) {
        console.error('Erro no reset de senha:', error);
        res.status(500).json({ message: 'Erro ao processar sua solicitação' });
    }
}

export async function resetPassword(req, res) {
    const { token, newPassword } = req.body;

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const user = await User.findByPk(decoded.id);
        
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await user.update({ password: hashedPassword });

        res.json({ message: 'Senha redefinida com sucesso' });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Link expirado. Solicite um novo link.' });
        }
        res.status(400).json({ message: 'Token inválido' });
    }
}

// Nova função para servir o formulário
export function serveResetPasswordForm(req, res) {
    res.sendFile(path.join(__dirname, '../public/reset-password.html'));
}