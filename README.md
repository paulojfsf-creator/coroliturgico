# 🎵 Gestão Litúrgica - Coro Paroquial São João Batista
## Versão 14.3 - Cânticos Personalizados (Novembro 2024)

---

## 🆕 NOVIDADE V14.3: CÂNTICOS PERSONALIZADOS

### Adiciona os teus próprios cânticos com partituras!

**Nova funcionalidade:**
- ✅ **Criar cânticos personalizados** que não estão no CSV
- ✅ **Upload de partituras** em PDF ou imagem
- ✅ **Captura de câmara** para tirar foto da partitura
- ✅ **Visualizar partituras** diretamente na app
- ✅ **Download** das partituras guardadas
- ✅ **Gestão completa** (adicionar, ver, apagar)

### Como funciona:

**Tab Catálogo → Secção "📝 Cânticos Personalizados"**

1. **Adicionar:**
   - Clica "➕ Adicionar Cântico"
   - Preenche título, secção, autor
   - Upload ficheiro OU tira foto da partitura
   - Guarda!

2. **Ver:**
   - Clica "👁️ Ver" em qualquer cântico
   - Visualiza a partitura (PDF ou imagem)
   - Download ou abre em nova aba

3. **Apagar:**
   - Clica "🗑️" para remover

### Formatos aceites:
- 📄 **PDF** - Partituras digitais
- 🖼️ **JPG/PNG** - Fotos ou scans
- 📱 **Câmara** - Tira foto diretamente

**Limite:** 5MB por ficheiro

---

## 📋 MUDANÇA PRINCIPAL DA V14

### Remoção da Tab "Pré-visualização"

**Motivação:**
A tab de pré-visualização foi removida para simplificar a interface da aplicação.

**O que mudou:**
- ❌ **Removido:** Tab "Pré-visualização" com controles de margem e modo editável
- ✅ **Mantido:** Toda a funcionalidade de folhetos guardados continua a funcionar
- ✅ **Mantido:** Geração automática de folhetos em segundo plano

**Como funciona agora:**
1. Preenche o programa na tab **"Programa"**
2. O folheto é gerado automaticamente em segundo plano (invisível)
3. Vai direto à tab **"Folhetos"** para guardar e visualizar
4. Clica em "💾 Guardar Folheto Atual" para guardar
5. Visualiza e imprime os folhetos guardados diretamente na tab "Folhetos"

**Vantagens:**
- Interface mais limpa e direta
- Menos cliques para guardar folhetos
- Workflow mais intuitivo: Programa → Folhetos

---

## 🎯 ESTRUTURA ATUAL DA APLICAÇÃO

### 8 Tabs Disponíveis:

1. **📅 Página inicial** - Calendário litúrgico + Próximas celebrações
2. **📝 Programa** - Criar/editar programas + Upload de imagem
3. **📁 Folhetos** - Guardar e gerir folhetos
4. **📚 Catálogo** - Cânticos + Histórico de uso
5. **📁 Partituras** - 2 pastas do Google Drive + Pesquisa
6. **🎥 Vídeos** - Vídeos do YouTube embebidos
7. **📊 Histórico** - Domingos e programas guardados
8. **🎵 Ensaios** - Links para WhatsApp e Email

---

## 🔄 WORKFLOW ATUALIZADO (V14)

### Criar e Guardar Folheto

```
Tab "Programa"
  ↓
Preenche data, título, cânticos
  ↓
[Folheto é gerado automaticamente em segundo plano]
  ↓
Tab "Folhetos"
  ↓
Clica "💾 Guardar Folheto Atual"
  ↓
Visualiza na lista de folhetos guardados
  ↓
Clica "👁️ Ver" para visualizar
  ↓
Clica "🖨️ Imprimir" na modal
```

---

## 💾 DETALHES TÉCNICOS

### Container Invisível

A aplicação ainda usa um `<div id="previewContainer">` invisível para:
- Gerar o HTML do folheto em tempo real
- Permitir que o botão "Guardar Folheto" capture o conteúdo
- Manter compatibilidade com código existente

**Localização no código:**
```html
<!-- Container invisível para geração de folhetos -->
<div id="previewContainer" style="display: none;"></div>
```

### Funções JavaScript Mantidas

Todas as funções relacionadas com preview foram mantidas:
- `updatePreview()` - Gera HTML do folheto
- Listeners para atualização automática
- Código de captura para folhetos guardados

**Funções Removidas:**
- Controles de margem personalizadas
- Modo editável do folheto
- Botão de exportar PDF na pré-visualização (mantido na visualização de folhetos guardados)

---

## 📊 FUNCIONALIDADES POR VERSÃO

### Versão 14.3 (Atual)
- ✅ **Cânticos personalizados** com upload de partituras
- ✅ **Câmara integrada** para tirar fotos de partituras
- ✅ **Suporte PDF e imagens** (JPG, PNG)
- ✅ **Visualização in-app** de partituras
- ✅ **Download** de partituras guardadas

### Versão 14.2
- ✅ **Cantos completamente retos** (border-radius: 0)
- ✅ Texto sempre visível em smartphones
- ✅ Font-size reduzido: 0.75rem mobile
- ✅ Espaçamento ultra-otimizado

### Versão 14.1
- ✅ Otimização completa para smartphones
- ✅ Tabs retangulares (não mais redondas)
- ✅ 3 breakpoints responsivos

### Versão 14.0
- ✅ Remoção da tab "Pré-visualização"
- ✅ Interface simplificada (8 tabs)

### Versão 13
- ✅ 2 pastas de partituras do Google Drive
- ✅ Pesquisa de partituras
- ✅ Apagar histórico individual de cânticos

---

## 🚀 INSTALAÇÃO

1. Extrai `grupocoral-v14-FINAL.zip`
2. Abre `index.html` num navegador
3. A aplicação está pronta a usar!

---

## 📝 NOTAS DA VERSÃO 14.3

### Nova Funcionalidade: Cânticos Personalizados

**Localização:**
Tab Catálogo → Secção "📝 Cânticos Personalizados"

**Campos disponíveis:**
- Título do cântico **(obrigatório)**
- Secção litúrgica (opcional)
- Autor (opcional)
- Observações/notas (opcional)
- Partitura PDF ou imagem **(até 5MB)**

**Upload de ficheiros:**
```javascript
// Formatos aceites
PDF: application/pdf
Imagens: image/jpeg, image/jpg, image/png, image/webp

// Limite de tamanho
MAX: 5MB por ficheiro

// Armazenamento
localStorage (base64)
```

**Funcionalidades:**
- ✅ Upload de ficheiro do dispositivo
- ✅ Captura direta com câmara
- ✅ Preview antes de guardar
- ✅ Visualização in-app (PDF embedded ou imagem)
- ✅ Download de partitura
- ✅ Abrir em nova aba
- ✅ Apagar cântico

**Storage:**
```javascript
localStorage.coroCustomSongs_v1 = [
  {
    id: timestamp,
    title: string,
    section: string,
    author: string,
    notes: string,
    fileData: base64,
    fileName: string,
    fileType: mime,
    fileSize: bytes,
    createdAt: ISO date
  }
]
```

### Uso de Armazenamento:

Com cânticos personalizados, o uso de localStorage pode aumentar:
- Sem ficheiros: ~3-6MB
- Com ficheiros: até ~10MB (limite do browser)

**Recomendação:** 
- Guarda apenas partituras essenciais
- Usa fotos comprimidas quando possível
- Faz backup regular do localStorage

---

**Status:** ✅ Pronto para produção  
**Última atualização:** Novembro 2024  
**Versão:** 14.3 (Cânticos Personalizados)
