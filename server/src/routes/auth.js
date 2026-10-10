import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { stmts } from '../db.js';
import { signToken, authRequired } from '../middleware/auth.js';

const router = Router();

router.post('/login', (req, res) => {
  const { password } = req.body || {};
  const user = stmts.getUser.get('admin');
  if (!user || !password || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }
  res.json({ token: signToken(user), username: user.username });
});

router.post('/change-password', authRequired, (req, res) => {
  const { oldPassword, newPassword } = req.body || {};
  const user = stmts.getUser.get('admin');
  if (!oldPassword || !bcrypt.compareSync(oldPassword, user.password_hash)) {
    return res.status(400).json({ error: '旧密码错误' });
  }
  if (!newPassword || String(newPassword).length < 6) {
    return res.status(400).json({ error: '新密码至少 6 位' });
  }
  stmts.updatePassword.run(bcrypt.hashSync(newPassword, 10), user.id);
  res.json({ ok: true });
});

router.get('/me', authRequired, (req, res) => {
  res.json({ username: req.user.username });
});

export default router;
