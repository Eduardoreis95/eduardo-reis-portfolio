/**
 * D.REIS_ | TECH / LAB — Eduardo Reis
 * Controle da Intro Gate Screen (100svh), teclado, microinterações e navegação principal.
 */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SESSION_KEY = 'dreis_gate_entered';

  // 1. Ano atual no rodapé
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // 2. Fallback elegante caso a fotografia principal não carregue
  const introPortraitImg = document.getElementById('introPortraitImg');
  const introPortraitStage = document.getElementById('introPortraitStage');
  if (introPortraitImg && introPortraitStage) {
    introPortraitImg.addEventListener('error', () => {
      introPortraitStage.classList.add('is-placeholder');
    });
    if (introPortraitImg.complete && introPortraitImg.naturalWidth === 0) {
      introPortraitStage.classList.add('is-placeholder');
    }
  }

  // 3. INTRO / GATE SCREEN — Estado, Sessão, Deep Links, Teclado e Transição
  const introGate = document.getElementById('introGate');
  const menuItems = Array.from(document.querySelectorAll('.intro-menu-item'));
  const skipLink = document.querySelector('.skip-link');
  let selectedIndex = 0;
  let gateActive = true;
  let isTransitioning = false;

  const setSelectedMenuIndex = (index, focusElement = false) => {
    selectedIndex = (index + menuItems.length) % menuItems.length;
    menuItems.forEach((item, idx) => {
      item.classList.toggle('is-selected', idx === selectedIndex);
    });
    if (focusElement && menuItems[selectedIndex]) {
      menuItems[selectedIndex].focus();
    }
  };

  const unlockImmediately = (targetHash = '') => {
    gateActive = false;
    document.body.classList.remove('gate-locked');
    if (introGate) {
      introGate.classList.add('is-hidden');
      introGate.setAttribute('aria-hidden', 'true');
    }
    try {
      sessionStorage.setItem(SESSION_KEY, 'true');
    } catch {
      // Ignora restrições de storage
    }
    if (targetHash && targetHash !== '#inicio') {
      const targetEl = document.querySelector(targetHash);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    }
  };

  const enterExperience = (targetSelector = '#inicio', triggeredButton = null) => {
    if (!gateActive || isTransitioning) return;
    isTransitioning = true;
    gateActive = false;

    try {
      sessionStorage.setItem(SESSION_KEY, 'true');
    } catch {
      // Ignora restrições de storage
    }

    if (triggeredButton) {
      triggeredButton.classList.add('is-triggered');
    }

    if (prefersReducedMotion || !introGate) {
      unlockImmediately(targetSelector);
      return;
    }

    // Inicia coreografia de saída (~800ms)
    introGate.classList.add('is-exiting');
    document.body.classList.remove('gate-locked');

    if (targetSelector && targetSelector !== '#inicio') {
      const targetEl = document.querySelector(targetSelector);
      if (targetEl) {
        setTimeout(() => {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }, 280);
      }
    }

    setTimeout(() => {
      introGate.classList.add('is-hidden');
      introGate.setAttribute('aria-hidden', 'true');
      isTransitioning = false;
    }, 820);
  };

  // Verifica se o visitante abriu um deep link (#projetos, #acervo, #contato, etc.) ou já entrou na sessão
  const initialHash = window.location.hash;
  const hasDeepLink = Boolean(initialHash && initialHash.length > 1);
  let hasEnteredInSession = false;
  try {
    hasEnteredInSession = sessionStorage.getItem(SESSION_KEY) === 'true';
  } catch {
    hasEnteredInSession = false;
  }

  if (hasDeepLink || hasEnteredInSession) {
    unlockImmediately(initialHash);
  }

  // Interações dos itens do menu da Intro
  menuItems.forEach((btn, idx) => {
    btn.addEventListener('mouseenter', () => {
      if (gateActive) setSelectedMenuIndex(idx, false);
    });

    btn.addEventListener('focus', () => {
      if (gateActive) setSelectedMenuIndex(idx, false);
    });

    btn.addEventListener('click', () => {
      setSelectedMenuIndex(idx, false);
      const target = btn.dataset.target || '#inicio';
      enterExperience(target, btn);
    });
  });

  // Navegação por teclado estilo menu inicial (↑ ↓ Enter Escape)
  document.addEventListener('keydown', (event) => {
    if (!gateActive) return;

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      setSelectedMenuIndex(selectedIndex + 1, true);
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      setSelectedMenuIndex(selectedIndex - 1, true);
    } else if (event.key === 'Enter') {
      const activeEl = document.activeElement;
      const isMenuBtn = activeEl && activeEl.classList.contains('intro-menu-item');
      const targetBtn = isMenuBtn ? activeEl : menuItems[selectedIndex];
      if (targetBtn) {
        event.preventDefault();
        const target = targetBtn.dataset.target || '#inicio';
        enterExperience(target, targetBtn);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      enterExperience('#inicio', menuItems[0]);
    }
  });

  if (skipLink) {
    skipLink.addEventListener('click', () => {
      if (gateActive) {
        unlockImmediately('#main');
      }
    });
  }

  // Microinteração de profundidade sutil no círculo da fotografia e atmosfera ao mover o cursor
  const introCircleFrame = document.getElementById('introCircleFrame');
  const orbPrimary = document.getElementById('orbPrimary');
  const orbSecondary = document.getElementById('orbSecondary');

  if (!prefersReducedMotion) {
    window.addEventListener(
      'mousemove',
      (event) => {
        const normX = event.clientX / window.innerWidth - 0.5;
        const normY = event.clientY / window.innerHeight - 0.5;

        if (gateActive && introCircleFrame) {
          introCircleFrame.style.transform = `translate3d(${normX * -4}px, ${normY * -4}px, 0) scale(1.01)`;
        }

        if (orbPrimary) {
          orbPrimary.style.transform = `translate3d(${normX * 24}px, ${normY * 24}px, 0)`;
        }
        if (orbSecondary) {
          orbSecondary.style.transform = `translate3d(${normX * -18}px, ${normY * -18}px, 0)`;
        }
      },
      { passive: true }
    );
  }

  // 4. Menu de navegação mobile do site principal
  const menuToggle = document.querySelector('.menu-toggle');
  const primaryNav = document.getElementById('primary-nav');
  const navLinks = document.querySelectorAll('.nav-link');

  if (menuToggle && primaryNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = primaryNav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        primaryNav.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && primaryNav.classList.contains('is-open')) {
        primaryNav.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.focus();
      }
    });

    // Fechar ao tocar fora do menu mobile
    document.addEventListener('click', (event) => {
      if (
        primaryNav.classList.contains('is-open') &&
        !primaryNav.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) {
        primaryNav.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 5. Scroll Reveal suave nas seções do site
  const revealElements = document.querySelectorAll('.reveal');
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  }

  // 6. Indicador de seção ativa no header
  const trackedSections = document.querySelectorAll('main section[id], header[id]');
  if ('IntersectionObserver' in window && trackedSections.length > 0) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach((link) => {
              const isMatch = link.getAttribute('href') === `#${id}`;
              link.classList.toggle('active', isMatch);
            });
          }
        });
      },
      { rootMargin: '-35% 0px -55% 0px' }
    );

    trackedSections.forEach((section) => navObserver.observe(section));
  }

  // 7. Seletor de Capacidades Profissionais (Tabs acessíveis)
  const capTabs = Array.from(document.querySelectorAll('.cap-tab'));
  const capPanels = Array.from(document.querySelectorAll('.cap-panel'));

  const activateCapability = (selectedTab) => {
    const targetKey = selectedTab.dataset.cap;

    capTabs.forEach((tab) => {
      const isSelected = tab === selectedTab;
      tab.classList.toggle('active', isSelected);
      tab.setAttribute('aria-selected', String(isSelected));
    });

    capPanels.forEach((panel) => {
      const isMatch = panel.dataset.panel === targetKey;
      panel.classList.toggle('active', isMatch);
      if (isMatch) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
    });
  };

  capTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateCapability(tab));

    tab.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        const nextTab = capTabs[(index + 1) % capTabs.length];
        nextTab.focus();
        activateCapability(nextTab);
      } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        const prevTab = capTabs[(index - 1 + capTabs.length) % capTabs.length];
        prevTab.focus();
        activateCapability(prevTab);
      }
    });
  });

  // 8. Ferramentas por Contexto (Hover & Click mostram como utilizo)
  const toolPills = document.querySelectorAll('.tool-pill');
  const toolGroupBadge = document.getElementById('toolGroupBadge');
  const toolTitle = document.getElementById('toolTitle');
  const toolDesc = document.getElementById('toolDesc');

  const selectTool = (pill) => {
    toolPills.forEach((item) => item.classList.remove('active'));
    pill.classList.add('active');

    if (toolGroupBadge && pill.dataset.group) {
      toolGroupBadge.textContent = pill.dataset.group;
    }
    if (toolTitle && pill.dataset.tool) {
      toolTitle.textContent = pill.dataset.tool;
    }
    if (toolDesc && pill.dataset.desc) {
      toolDesc.textContent = pill.dataset.desc;
    }
  };

  toolPills.forEach((pill) => {
    pill.addEventListener('click', () => selectTool(pill));
    pill.addEventListener('mouseenter', () => selectTool(pill));
  });

  // 8b. Expansão sob demanda do Ecossistema Completo de Ferramentas
  const ecosystemExpandBtn = document.getElementById('ecosystemExpandBtn');
  const ecosystemExpandLabel = document.getElementById('ecosystemExpandLabel');
  const fullEcosystemGrid = document.getElementById('fullEcosystemGrid');

  if (ecosystemExpandBtn && fullEcosystemGrid) {
    ecosystemExpandBtn.addEventListener('click', () => {
      const isExpanded = ecosystemExpandBtn.getAttribute('aria-expanded') === 'true';
      const nextState = !isExpanded;

      ecosystemExpandBtn.setAttribute('aria-expanded', String(nextState));
      if (ecosystemExpandLabel) {
        ecosystemExpandLabel.textContent = nextState
          ? 'Recolher ecossistema completo'
          : 'Explorar ecossistema completo';
      }

      if (nextState) {
        fullEcosystemGrid.removeAttribute('hidden');
      } else {
        fullEcosystemGrid.setAttribute('hidden', '');
      }
    });
  }

  // 9. Galeria de Projetos — Abertura de Case em Modal/Drawer (Home = Descoberta, Case = Profundidade)
  const CASES_DATA = {
    mindli: {
      category: 'Produto digital · Ecossistema GLC',
      title: 'MINDLI',
      url: 'https://mindli.com.br',
      urlLabel: 'mindli.com.br ↗',
      lead: 'Produto digital preparado para lançamento e comercialização, associado ao ecossistema da GLC Softwares.',
      context:
        'Desenvolvimento e evolução de produto digital dentro do ecossistema tecnológico da GLC Softwares.',
      problem:
        'Conectar arquitetura funcional, interfaces e regras de negócio em um produto digital consistente e preparado para comercialização.',
      solution:
        'Estruturação de fluxos de telas, componentes de interface no Figma e desenvolvimento full stack com consumo de APIs REST.',
      role: 'Participação em UI/UX, produto e desenvolvimento full stack dentro do ecossistema GLC.',
      tech: 'Figma, React, TypeScript, HTML, CSS, JavaScript e APIs REST.',
      learning:
        'A integração entre visão de produto e desenvolvimento front e back-end confere solidez técnica e rapidez na validação de soluções digitais.'
    },
    fiddelite: {
      category: 'Produto de Fidelização & Retenção',
      title: 'FIDDELITE',
      url: '',
      urlLabel: '',
      lead: 'Solução e produto de fidelização e retenção preparado para comercialização.',
      context:
        'Desenvolvimento de uma plataforma de prateleira voltada a estratégias de fidelização e retenção de clientes.',
      problem:
        'Necessidade de disponibilizar uma plataforma de fidelização acessível, com operação simplificada e implantação descomplicada.',
      solution:
        'Concepção de produto, arquitetura funcional e desenvolvimento de fluxos intuitivos para gestão de programas de fidelidade.',
      role: 'Concepção de produto, arquitetura funcional, UI/UX e desenvolvimento.',
      tech: 'Produto Digital, Fidelização, Retenção, UI/UX e Desenvolvimento Full Stack.',
      learning:
        'Produtos de prateleira demandam interfaces diretas e regras funcionais claras para facilitar a adoção operacional.'
    },
    neo8bit: {
      category: 'Projeto Tecnológico Pessoal · Laboratório Digital',
      title: 'NEO8BIT',
      url: 'https://neo8bit.com',
      urlLabel: 'neo8bit.com ↗',
      lead: 'Projeto tecnológico pessoal e laboratório digital voltado à experimentação de interfaces e engenharia web.',
      context:
        'Iniciativa pessoal como laboratório digital para experimentação de padrões de interface, boas práticas e tecnologias web.',
      problem:
        'Criar um espaço autoral de teste e consolidação de técnicas modernas de desenvolvimento web e design.',
      solution:
        'Concepção de interfaces limpas, componentização semântica e implementação front-end com foco em performance e precisão visual.',
      role: 'Idealização · UI/UX · Desenvolvimento Front-end.',
      tech: 'Figma, HTML, CSS, JavaScript, Git e plataformas de deploy.',
      learning:
        'Laboratórios digitais próprios aceleram o aprendizado prático e servem de bancada de testes para projetos em produção.'
    },
    vaiordo: {
      category: 'Logística · Rotas & Entregas',
      title: 'VAIORDO',
      url: '',
      urlLabel: '',
      lead: 'Projeto voltado a soluções e organização de fluxos para logística, rotas e entregas.',
      context:
        'Contexto operacional de logística, movimentação e acompanhamento de rotas e entregas.',
      problem:
        'Complexidade no acompanhamento de status de entregas e ausência de fluxos intuitivos para a operação diária.',
      solution:
        'Mapeamento de rotinas operacionais, arquitetura da informação, design de interfaces e prototipação voltada à eficiência de rotas.',
      role: 'Discovery de Produto · Logística & Rotas · UI/UX · Front-end.',
      tech: 'Figma, Discovery, UI/UX, Design de Interfaces e Front-end.',
      learning:
        'Soluções em logística exigem fluxos enxutos, visibilidade de status e foco absoluto na usabilidade de quem opera na ponta.'
    },
    glc: {
      category: 'Atuação Profissional Atual',
      title: 'GLC SOFTWARES',
      url: 'https://glc.dev',
      urlLabel: 'glc.dev ↗',
      lead: 'Atuação profissional como UI/UX & Full Stack Developer, participando de produtos digitais, interfaces e soluções.',
      context:
        'Atuação contínua como UI/UX & Full Stack Developer na GLC Softwares, participando ativamente do ciclo de vida de soluções tecnológicas.',
      problem:
        'Criar produtos e soluções que equilibrem rigor de usabilidade, eficiência arquitetural e sustentabilidade de código.',
      solution:
        'Participação desde o discovery e prototipação de interfaces até a implementação full stack de aplicações, APIs e bancos de dados.',
      role: 'UI/UX & Full Stack Developer (participação em produtos digitais, interfaces e desenvolvimento de soluções).',
      tech: 'Figma, React, TypeScript, Node.js, Java, Python, PostgreSQL, Supabase e Docker.',
      learning:
        'Atuar de forma integrada entre design de interface e engenharia de software minimiza retrabalho e entrega valor consistente.'
    },
    internos: {
      category: 'Sistemas Internos & Automações',
      title: 'SISTEMAS INTERNOS & AUTOMAÇÕES',
      url: '',
      urlLabel: '',
      lead: 'Intranets, ferramentas operacionais e automação de fluxos corporativos sob medida.',
      context:
        'Rotinas empresariais que exigem padronização de processos, centralização de dados e eliminação de etapas manuais.',
      problem:
        'Fluxos dispersos, retrabalho em tarefas repetitivas e sistemas isolados que geravam atrito operacional.',
      solution:
        'Desenvolvimento de centrais internas sob medida e automação de fluxos integrando serviços via APIs REST e Webhooks com n8n e Python.',
      role: 'Processos · Dados · Automação · Full Stack.',
      tech: 'n8n, Python, pandas, REST APIs, Webhooks, PostgreSQL e React.',
      learning:
        'Automações e sistemas internos de maior impacto são aqueles que partem do entendimento prévio e minucioso da rotina de trabalho real.'
    },
    workspace: {
      category: 'Implantação Corporativa',
      title: 'IMPLANTAÇÃO GOOGLE WORKSPACE',
      url: '',
      urlLabel: '',
      lead: 'Planejamento, parametrização, governança e condução individual da implantação para escritório corporativo.',
      context:
        'Necessidade de estruturar um ambiente corporativo profissional para unificar comunicação, armazenamento seguro e colaboração.',
      problem:
        'Descentralização de contas, falta de governança de permissões e ausência de padronização nas rotinas de arquivos e comunicação.',
      solution:
        'Planejamento técnico, configuração de domínio, gestão de permissões, estruturação de drives compartilhados e condução da adoção pelos usuários.',
      role: 'Planejamento · Configuração de Ambiente · Governança · Adoção.',
      tech: 'Google Workspace, Console de Administração, Políticas de Segurança e Gestão de Usuários.',
      learning:
        'A implantação bem-sucedida de um ambiente corporativo depende tanto do rigor técnico na configuração quanto da clareza na orientação das pessoas.'
    }
  };

  const caseModalBackdrop = document.getElementById('caseModalBackdrop');
  const caseModalClose = document.getElementById('caseModalClose');
  const caseModalCategory = document.getElementById('caseModalCategory');
  const caseModalTitle = document.getElementById('caseModalTitle');
  const caseModalLink = document.getElementById('caseModalLink');
  const caseModalLead = document.getElementById('caseModalLead');
  const caseModalContext = document.getElementById('caseModalContext');
  const caseModalProblem = document.getElementById('caseModalProblem');
  const caseModalSolution = document.getElementById('caseModalSolution');
  const caseModalRole = document.getElementById('caseModalRole');
  const caseModalTech = document.getElementById('caseModalTech');
  const caseModalLearning = document.getElementById('caseModalLearning');
  const caseOpenButtons = document.querySelectorAll('[data-open-case]');
  let lastFocusedCaseTrigger = null;

  const openCaseModal = (caseKey, triggerEl = null) => {
    const data = CASES_DATA[caseKey];
    if (!data || !caseModalBackdrop) return;

    lastFocusedCaseTrigger = triggerEl;

    if (caseModalCategory) caseModalCategory.textContent = data.category;
    if (caseModalTitle) caseModalTitle.textContent = data.title;
    if (caseModalLead) caseModalLead.textContent = data.lead;
    if (caseModalContext) caseModalContext.textContent = data.context;
    if (caseModalProblem) caseModalProblem.textContent = data.problem;
    if (caseModalSolution) caseModalSolution.textContent = data.solution;
    if (caseModalRole) caseModalRole.textContent = data.role;
    if (caseModalTech) caseModalTech.textContent = data.tech;
    if (caseModalLearning) caseModalLearning.textContent = data.learning;

    if (caseModalLink) {
      if (data.url) {
        caseModalLink.href = data.url;
        caseModalLink.textContent = data.urlLabel || 'Visitar projeto ↗';
        caseModalLink.removeAttribute('hidden');
      } else {
        caseModalLink.setAttribute('hidden', '');
      }
    }

    caseModalBackdrop.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';

    // Foco inicial acessível
    setTimeout(() => {
      if (caseModalClose) {
        caseModalClose.focus();
      }
    }, 50);
  };

  const closeCaseModal = () => {
    if (!caseModalBackdrop || caseModalBackdrop.hasAttribute('hidden')) return;
    caseModalBackdrop.setAttribute('hidden', '');
    document.body.style.overflow = '';

    if (lastFocusedCaseTrigger && typeof lastFocusedCaseTrigger.focus === 'function') {
      lastFocusedCaseTrigger.focus();
    }
  };

  caseOpenButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-open-case');
      if (key) openCaseModal(key, btn);
    });
  });

  if (caseModalClose) {
    caseModalClose.addEventListener('click', closeCaseModal);
  }

  if (caseModalBackdrop) {
    caseModalBackdrop.addEventListener('click', (event) => {
      if (event.target === caseModalBackdrop) {
        closeCaseModal();
      }
    });
  }

  // Trap de foco e Escape dentro do modal
  document.addEventListener('keydown', (event) => {
    if (!caseModalBackdrop || caseModalBackdrop.hasAttribute('hidden')) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeCaseModal();
      return;
    }

    if (event.key === 'Tab') {
      const focusableElements = Array.from(
        caseModalBackdrop.querySelectorAll(
          'a[href]:not([hidden]), button:not([disabled]):not([hidden]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });

      if (focusableElements.length === 0) return;

      const firstEl = focusableElements[0];
      const lastEl = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstEl) {
          event.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          event.preventDefault();
          firstEl.focus();
        }
      }
    }
  });

  // 10. Filtro de Categorias do Acervo Tecnológico (Acessível via teclado e aria-pressed)
  const acervoFilters = document.querySelectorAll('.acervo-filter');
  const acervoEntries = document.querySelectorAll('.acervo-entry');

  acervoFilters.forEach((btn) => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.filter || 'todos';

      acervoFilters.forEach((item) => {
        const isActive = item === btn;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-pressed', String(isActive));
      });

      acervoEntries.forEach((entry) => {
        const entryCat = entry.dataset.category || '';
        const shouldShow =
          category === 'todos' ||
          entryCat.toLowerCase().includes(category.toLowerCase());

        if (shouldShow) {
          entry.removeAttribute('hidden');
        } else {
          entry.setAttribute('hidden', '');
        }
      });
    });
  });

  // 11. Botões Voltar ao Topo (Rodapé & Botão Flutuante Confiáveis)
  const footerBackTop = document.getElementById('footerBackTop');
  const floatingBackTop = document.getElementById('floatingBackTop');

  const scrollToTop = () => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: isReduced ? 'auto' : 'smooth'
    });

    // Remove hash do topo sem recarregar para manter histórico limpo
    if (window.location.hash && window.location.hash === '#inicio') {
      try {
        history.replaceState(null, '', window.location.pathname);
      } catch {}
    }

    // Move foco de forma acessível para a logo/início do cabeçalho
    const brandLink = document.querySelector('.header-inner .brand');
    if (brandLink) {
      brandLink.focus({ preventScroll: true });
    }
  };

  if (footerBackTop) {
    footerBackTop.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToTop();
    });
  }

  if (floatingBackTop) {
    floatingBackTop.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToTop();
    });

    let scrollTicking = false;
    const updateFloatingVisibility = () => {
      // Exibe quando passar de 360px de scroll e o gate não estiver ativo
      const shouldShow = !gateActive && window.scrollY > 360;
      if (shouldShow) {
        floatingBackTop.removeAttribute('hidden');
        floatingBackTop.classList.add('is-visible');
      } else {
        floatingBackTop.classList.remove('is-visible');
        setTimeout(() => {
          if (!floatingBackTop.classList.contains('is-visible')) {
            floatingBackTop.setAttribute('hidden', '');
          }
        }, 280);
      }
      scrollTicking = false;
    };

    window.addEventListener(
      'scroll',
      () => {
        if (!scrollTicking) {
          window.requestAnimationFrame(updateFloatingVisibility);
          scrollTicking = true;
        }
      },
      { passive: true }
    );
  }
});
