# Database Switching Guide

This project supports **flexible database switching** between Bun SQLite (local development) and Cloudflare D1 (production).

## 🔄 **Switch Database Types**

### **SQLite (Local Development)**
```env
DATABASE_TYPE=sqlite
```

### **D1 (Cloudflare Production)**
```env  
DATABASE_TYPE=d1
```

## 🚀 **Deployment Options**

### **Option 1: Cloudflare Workers + D1** ⭐ *Recommended*
1. **Setup D1 Database:**
```bash
npx wrangler d1 create taskmanager-db
# Update wrangler.toml with database ID
```

2. **Deploy to Cloudflare:**
```bash
# Backend
DATABASE_TYPE=d1 npx wrangler deploy

# Frontend  
# Upload public/ folder to Cloudflare Pages
```

### **Option 2: Keep Current Setup**
- Deploy frontend to **Cloudflare Pages**
- Deploy backend to **Vercel/Railway/Render** (SQLite)
- Update frontend API URLs

## 📁 **Project Structure**
```
src/repository/
├── database-interface.ts    # Common interface
├── sqlite-db.ts            # Bun SQLite implementation  
├── d1-db.ts                # Cloudflare D1 implementation
└── database.ts             # Factory & wrapper
```

## ⚡ **Key Benefits**
✅ **Zero breaking changes** - Same API for controllers  
✅ **Environment-based switching** - Just change DATABASE_TYPE  
✅ **Async/await support** - Ready for both databases  
✅ **Easy migration** - 15-minute conversion  

## 🔧 **Local Testing**
```bash
# SQLite (Current)
DATABASE_TYPE=sqlite bun run dev

# D1 (Future - after deployment setup)  
DATABASE_TYPE=d1 bun run dev
```

Your project is now **deployment-ready** for Cloudflare! 🚀