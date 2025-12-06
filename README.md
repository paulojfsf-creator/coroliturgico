# 🎵 Gestão Litúrgica - Coro Paroquial São João Batista
## Versão 15.0 - Simplificação (Novembro 2024)

---

## 🔄 V15.0: SIMPLIFICAÇÃO E LIMPEZA

### Mudanças desta versão:

**Removido:**
- ❌ **Leituras do Dia** (página inicial)
- ❌ **Leituras no Programa** (por data)
- ❌ Código JavaScript de leituras (~700 linhas)
- ❌ API Evangelizo.org
- ❌ Sistema de cache de leituras

**Melhorado:**
- ✅ **Botão de Remover Imagem** do domingo
- ✅ **Preview da imagem** antes de guardar
- ✅ **Validação de ficheiro** (tamanho e tipo)
- ✅ **Gestão visual** da imagem

### Funcionalidade de Imagem:

**Como funciona:**
1. Upload de imagem do domingo
2. Preview automático da imagem
3. Botão "🗑️ Remover Imagem" aparece
4. Imagem fica guardada em localStorage
5. Carrega automaticamente ao abrir a app

**Validações:**
- Máximo 2MB por imagem
- Apenas ficheiros de imagem (JPG, PNG, WebP, etc.)
- Confirmação antes de remover

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

### Versão 15.0 (Atual) - SIMPLIFICAÇÃO
- ❌ **Removidas leituras do dia** (simplificação)
- ✅ **Botão remover imagem** do domingo
- ✅ **Preview de imagem** automático
- ✅ **Validação de ficheiros** (2MB máx)
- ✅ **Código mais leve** (~700 linhas removidas)

### Versão 14.7
- ✅ Corrigido: `updateDashboard` scope
- ✅ Removido código obsoleto de margens

### Versão 14.6
- ✅ Corrigido erro `applyCustomMargins`
- ✅ Console limpo

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

---

## 🚀 INSTALAÇÃO

1. Extrai `grupocoral-v14-FINAL.zip`
2. Abre `index.html` num navegador
3. A aplicação está pronta a usar!

---

## 📝 NOTAS DA VERSÃO 14.5

### Melhoria: Leituras Integradas no Programa

**Localização principal:**
Tab **Programa** → Seleciona data → **Leituras aparecem automaticamente**

**Como funciona:**
```
1. Abre Tab Programa
2. Seleciona data no campo "Data"
3. Leituras dessa data carregam automaticamente
4. Aparecem por baixo dos cânticos
5. Podes expandir/colapsar cada leitura
6. Escolhes cânticos com contexto litúrgico
```

**Diferenças entre os 2 locais:**

| Local | Finalidade | Data | Cache |
|-------|-----------|------|-------|
| **Página Inicial** | Consulta rápida | Hoje | 12 horas |
| **Programa** | Contexto ao criar | Data selecionada | 24 horas/data |

**Vantagens:**
- ✅ Vês evangelho enquanto escolhes entrada/comunhão
- ✅ Relacionas salmo com momento litúrgico
- ✅ Tema do dia está visível durante criação
- ✅ Não precisas mudar de tab

**Cache inteligente:**
```javascript
localStorage.coroReadings_program_cache = {
  "2024-11-29": {
    readings: {...},
    timestamp: number
  },
  "2024-12-01": {
    readings: {...},
    timestamp: number
  }
  // Múltiplas datas guardadas
  // Limpeza automática após 30 dias
}
```

**Funcionamento:**
1. **Seleciona data** → Verifica cache
2. **Se em cache** → Mostra instantaneamente
3. **Se não** → Busca API → Guarda cache
4. **Cache válido** → 24 horas por data
5. **Auto-limpeza** → Remove datas antigas (>30 dias)

---

**Status:** ✅ Pronto para produção  
**Última atualização:** Novembro 2024  
**Versão:** 14.5 (Leituras Integradas)
