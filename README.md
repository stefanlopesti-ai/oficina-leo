# 🔧 Oficina do Léo — Sistema

Sistema de gestão de oficina mecânica com Google Sheets como backend e GitHub Pages como hospedagem gratuita.

---

## 📁 Arquivos

| Arquivo | Descrição | Quem acessa |
|---|---|---|
| `mecanico.html` | Painel administrativo completo | Mecânico / dono |
| `cliente.html` | Área do cliente (OS, aprovação) | Clientes |

---

## 🚀 Deploy no GitHub Pages (passo a passo)

### 1. Criar o repositório

1. Acesse [github.com](https://github.com) e faça login
2. Clique em **"New repository"** (botão verde)
3. Nome sugerido: `oficina-leo`
4. Deixe **Public** (obrigatório para GitHub Pages gratuito)
5. Marque **"Add a README file"**
6. Clique em **"Create repository"**

### 2. Fazer upload dos arquivos

1. Dentro do repositório, clique em **"Add file" → "Upload files"**
2. Arraste os arquivos:
   - `mecanico.html`
   - `cliente.html`
   - `README.md` (substitua o gerado)
3. Clique em **"Commit changes"**

### 3. Ativar o GitHub Pages

1. No repositório, vá em **Settings** (aba no topo)
2. No menu lateral, clique em **"Pages"**
3. Em **"Source"**, selecione:
   - Branch: `main`
   - Pasta: `/ (root)`
4. Clique em **"Save"**
5. Aguarde ~1 minuto e o link aparecerá:
   ```
   https://SEU_USUARIO.github.io/oficina-leo/
   ```

### 4. URLs finais

Após o deploy, seus links serão:

```
Mecânico:  https://SEU_USUARIO.github.io/oficina-leo/mecanico.html
Cliente:   https://SEU_USUARIO.github.io/oficina-leo/cliente.html
```

---

## ⚙️ Configuração do Google Apps Script

### 1. Criar o script

1. Acesse [script.google.com](https://script.google.com)
2. Clique em **"Novo projeto"**
3. Cole o conteúdo do arquivo `apps-script.gs`
4. Altere o `SHEET_ID` para o ID da sua planilha

### 2. Inicializar a planilha

1. No editor do Apps Script, selecione a função `inicializarPlanilha`
2. Clique em **▶ Executar**
3. Autorize as permissões quando solicitado

### 3. Implantar como App da Web

1. Clique em **"Implantar" → "Nova implantação"**
2. Tipo: **App da Web**
3. Executar como: **Eu**
4. Quem pode acessar: **Qualquer pessoa**
5. Clique em **"Implantar"**
6. Copie a URL gerada (começa com `https://script.google.com/macros/s/...`)

### 4. Atualizar a URL nos HTMLs

Nos dois arquivos, substitua o valor de `SCRIPT_URL` pela URL copiada:

**mecanico.html** (linha ~2691):
```javascript
const SCRIPT_URL = 'SUA_URL_AQUI';
```

**cliente.html** (linha ~955):
```javascript
let SCRIPT_URL = localStorage.getItem(SCRIPT_URL_KEY) || 'SUA_URL_AQUI';
```

---

## 🔄 Como atualizar os arquivos depois

1. No GitHub, clique no arquivo que quer atualizar
2. Clique no ícone de **lápis** (editar)
3. Ou clique em **"Add file" → "Upload files"** para substituir

As alterações ficam online em segundos.

---

## 🔗 Links rápidos

- [GitHub](https://github.com)
- [Google Apps Script](https://script.google.com)
- [Google Sheets](https://sheets.google.com)

---

*Desenvolvido por Stefan Lopes de Aquino*
