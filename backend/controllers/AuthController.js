const authService = require('../services/AuthService');

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.cookie('accessToken', result.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 15 * 60 * 1000 });
      res.cookie('refreshToken', result.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.json({ user: result.user, accessToken: result.accessToken });
    } catch (err) { res.status(err.status || 500).json({ message: err.message }); }
  }

  async refresh(req, res) {
    try {
      const token = req.cookies?.refreshToken;
      const result = await authService.refresh(token);
      res.cookie('accessToken', result.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 15 * 60 * 1000 });
      res.json(result);
    } catch (err) { res.status(err.status || 500).json({ message: err.message }); }
  }

  async logout(req, res) {
    try {
      await authService.logout(req.user.id);
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      res.json({ message: 'Logged out' });
    } catch (err) { res.status(500).json({ message: err.message }); }
  }
}

module.exports = new AuthController();
