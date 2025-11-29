# 🎵 Gestão Litúrgica - Coro Paroquial São João Batista
## Versão 14.4 - Leituras do Dia (Novembro 2024)

---

## 🆕 NOVIDADE V14.4: LEITURAS DO DIA

### Leituras litúrgicas automáticas!

**Nova funcionalidade:**
- ✅ **Leituras do dia** carregadas automaticamente
- ✅ **Fonte portuguesa** (Evangelizo.org)
- ✅ **Cache de 12 horas** para rapidez
- ✅ **Expandir/colapsar** cada leitura
- ✅ **Copiar texto** para área de transferência
- ✅ **Links alternativos** se falhar

### Leituras incluídas:

- 📖 **Primeira Leitura** com referência
- 🎵 **Salmo Responsorial** com refrão
- 📖 **Segunda Leitura** (quando aplicável)
- ✝️ **Evangelho** com referência

### Como usar:

**Tab Página Inicial → Secção "📖 Leituras do Dia"**

1. **Carregar:**
   - Clica "🔄 Carregar Leituras"
   - Aguarda alguns segundos
   - Leituras aparecem automaticamente

2. **Ver:**
   - Clica em cada leitura para expandir
   - Lê o texto completo
   - Vê referência bíblica

3. **Copiar:**
   - Clica "📋 Copiar" em qualquer leitura
   - Texto vai para área de transferência
   - Cola onde precisares

### Características:

- 🔄 **Auto-refresh** diário
- 💾 **Cache local** evita carregamentos repetidos
- 🌐 **API Evangelizo.org** em português
- 📱 **Responsivo** para mobile
- 🔗 **Links de backup** se API falhar

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

### Versão 14.4 (Atual)
- ✅ **Leituras do dia** carregadas automaticamente
- ✅ **API Evangelizo.org** em português
- ✅ **Cache de 12 horas** para performance
- ✅ **Copiar leituras** para área de transferência
- ✅ **Links alternativos** se API falhar

### Versão 14.3
- ✅ **Cânticos personalizados** com upload de partituras
- ✅ **Câmara integrada** para tirar fotos
- ✅ **Suporte PDF e imagens**
- ✅ **Visualização in-app** de partituras

### Versão 14.2
- ✅ **Cantos completamente retos** (border-radius: 0)
- ✅ Texto sempre visível em smartphones
- ✅ Font-size otimizado para mobile

### Versão 14.1
- ✅ Otimização completa para smartphones
- ✅ Tabs retangulares
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

## 📝 NOTAS DA VERSÃO 14.4

### Nova Funcionalidade: Leituras do Dia

**Localização:**
Tab **Página Inicial** → Secção **"📖 Leituras do Dia"**

**API utilizada:**
```
Evangelizo.org
URL: https://publication.evangelizo.ws/PT/days/YYYY-MM-DD
Idioma: Português
Cache: 12 horas
```

**Leituras incluídas:**
1. Título litúrgico do dia
2. Primeira Leitura (+ referência)
3. Salmo Responsorial (+ refrão)
4. Segunda Leitura (quando aplicável)
5. Evangelho (+ referência)

**Funcionalidades:**
- ✅ Carregamento automático via API
- ✅ Cache local de 12 horas
- ✅ Expandir/colapsar cada leitura
- ✅ Copiar texto para clipboard
- ✅ Links alternativos se API falhar
- ✅ Data formatada em português

**Cache:**
```javascript
localStorage.coroReadings_cache = {
  readings: {...},
  date: ISO string,
  timestamp: number
}

// Validade: 12 horas E mesmo dia
// Auto-refresh: quando muda de dia
```

**Links de backup:**
- liturgia.pt
- dehonianos.org
- capuchinhos.org

**Requisitos:**
- ✅ Ligação à internet (primeira vez do dia)
- ✅ CORS habilitado (API pública)
- ✅ JavaScript ativo

---

**Status:** ✅ Pronto para produção  
**Última atualização:** Novembro 2024  
**Versão:** 14.4 (Leituras do Dia)
