const products = [
  {
    slug: "bolsa-juliana",
    name: "Bolsa Juliana",
    displayName: "Bolsa Juliana Grande em Nylon Impermeável",
    category: "Bolsa",
    oldPrice: "",
    price: "R$195,00",
    badge: "",
    image: "./assets/bolsa-juliana-preta.webp",
    gallery: [
      "./assets/bolsa-juliana-preta.webp",
      "./assets/bolsa-juliana-azul.webp",
      "./assets/bolsa-juliana-caramelo.webp",
      "./assets/bolsa-juliana-verde.webp",
      "./assets/bolsa-juliana-cinza-uso.webp"
    ],
    colors: [
      { label: "Preto", value: "#111111", image: "./assets/bolsa-juliana-preta.webp" },
      { label: "Azul marinho", value: "#1d2d4b", image: "./assets/bolsa-juliana-azul.webp" },
      { label: "Cáqui", value: "#8a7a58", image: "./assets/bolsa-juliana-caramelo.webp" },
      { label: "Verde musgo", value: "#535f43", image: "./assets/bolsa-juliana-verde.webp" },
      { label: "Bege claro", value: "#d8c8ad", image: "./assets/bolsa-juliana-caramelo.webp" },
      { label: "Vinho", value: "#6f1d2b", image: "./assets/bolsa-juliana-preta.webp", available: false }
    ],
    description: "Bolsa Juliana Grande em Nylon Impermeável. Ideal para quem busca praticidade, espaço e estilo no dia a dia.",
    pitch: "Elegante, resistente e espaçosa para acompanhar trabalho, estudos, viagens curtas e rotina intensa sem perder o estilo.",
    benefitLead: "A Bolsa Juliana Grande em Nylon Impermeável é ideal para quem precisa levar itens do dia a dia com praticidade, espaço e organização, sem abrir mão de um visual elegante.",
    homeBenefits: ["Elegante", "Resistente", "Espaçosa", "Fabricação própria", "Envio para todo o Brasil"],
    trust: ["Pagamento seguro", "Troca facilitada", "Envio para todo o Brasil"],
    details: [
      "Material em nylon durável, resistente à água e fácil de limpar.",
      "Três repartições grandes com zíper.",
      "Bolso interno com zíper no forro.",
      "Bolso traseiro com zíper e bolso frontal com zíper.",
      "Bolsos laterais para garrafa de água ou guarda-chuva.",
      "Alça de ombro reforçada e alça longa ajustável."
    ]
  },
  {
    slug: "bolsa-amelia-rsqua",
    name: "Bolsa Amarele",
    category: "Bolsa",
    oldPrice: "",
    price: "R$185,00",
    badge: "",
    image: "./assets/bolsa-amelia.webp",
    gallery: ["./assets/bolsa-amelia.webp", "./assets/bolsa-amelia-2.webp"],
    colors: [{ label: "Variações", value: "#1f1f1f", image: "./assets/bolsa-amelia.webp" }],
    description: "Bolsa compacta para rotina, passeio e organização dos itens essenciais.",
    details: ["Modelo leve em nylon.", "Alça confortável.", "Bolso frontal e fechamento por zíper."]
  },
  {
    slug: "mochila-antifurto-nylon",
    name: "Mochila Amarele",
    category: "Mochila",
    oldPrice: "",
    price: "R$155,00",
    badge: "",
    image: "./assets/mochila-antifurto.webp",
    gallery: ["./assets/mochila-antifurto.webp", "./assets/mochila-antifurto-2.webp"],
    colors: [
      { label: "Preto", value: "#111111", image: "./assets/mochila-antifurto.webp" },
      { label: "Azul marinho", value: "#1d2d4b", image: "./assets/mochila-antifurto-2.webp" }
    ],
    description: "Mochila em nylon impermeável, ideal para trabalho, escola, universidade e passeios.",
    details: ["Material em nylon impermeável.", "Compartimentos internos para organização.", "Modelo prático para rotina."]
  },
  {
    slug: "mochila-antifurto-grande-nylon-bvec4",
    name: "Mochila Antifurto Grande Nylon",
    category: "Mochila",
    oldPrice: "",
    price: "R$185,00",
    badge: "",
    image: "./assets/mochila-antifurto-grande.webp",
    gallery: ["./assets/mochila-antifurto-grande.webp"],
    colors: [{ label: "Preto", value: "#111111", image: "./assets/mochila-antifurto-grande.webp" }],
    description: "Versão grande da mochila antifurto, com mais espaço e praticidade.",
    details: ["Boa capacidade interna.", "Uso diário e viagens curtas.", "Acabamento resistente."]
  },
  {
    slug: "bolsa-baby",
    name: "Bolsa Baby Pequena",
    category: "Bolsa",
    oldPrice: "",
    price: "R$130,00",
    badge: "",
    image: "./assets/bolsa-baby.webp",
    gallery: ["./assets/bolsa-baby.webp"],
    colors: [{ label: "Única", value: "#111111", image: "./assets/bolsa-baby.webp" }],
    description: "Bolsa Baby Pequena prática para rotina com bebê, com espaço interno e bolsos.",
    details: ["Compartimentos funcionais.", "Nylon resistente.", "Fácil de limpar."]
  },
  {
    slug: "bolsa-bau-4fnqg",
    name: "Bolsa Baú",
    category: "Bolsa",
    oldPrice: "",
    price: "R$185,00",
    badge: "",
    image: "./assets/bolsa-bau.webp",
    gallery: ["./assets/bolsa-bau.webp"],
    colors: [{ label: "Única", value: "#111111", image: "./assets/bolsa-bau.webp" }],
    description: "Bolsa em formato baú com estrutura e boa abertura.",
    details: ["Formato espaçoso.", "Fechamento por zíper.", "Alças reforçadas."]
  },
  {
    slug: "bolsa-carioca",
    name: "Bolsa Carioca",
    category: "Bolsa",
    oldPrice: "",
    price: "R$195,00",
    badge: "",
    image: "./assets/bolsa-carioca.webp",
    gallery: ["./assets/bolsa-carioca.webp"],
    colors: [{ label: "Única", value: "#111111", image: "./assets/bolsa-carioca.webp" }],
    description: "Bolsa leve e espaçosa para uso casual.",
    details: ["Modelo versátil.", "Nylon impermeável.", "Boa capacidade interna."]
  },
  {
    slug: "bolsa-maricia",
    name: "Bolsa Marícia",
    category: "Bolsa",
    oldPrice: "",
    price: "R$195,00",
    badge: "",
    image: "./assets/bolsa-maricia.webp",
    gallery: ["./assets/bolsa-maricia.webp"],
    colors: [{ label: "Única", value: "#111111", image: "./assets/bolsa-maricia.webp" }],
    description: "Bolsa estruturada, resistente e elegante.",
    details: ["Acabamento reforçado.", "Bolsos externos.", "Uso profissional e cotidiano."]
  },
  {
    slug: "pasta-universitaria",
    name: "Pasta Universitária",
    category: "Bolsa",
    oldPrice: "",
    price: "R$175,00",
    badge: "",
    image: "./assets/pasta-universitaria.webp",
    gallery: ["./assets/pasta-universitaria.webp"],
    colors: [{ label: "Única", value: "#111111", image: "./assets/pasta-universitaria.webp" }],
    description: "Pasta para universidade, trabalho e organização de documentos.",
    details: ["Formato prático.", "Boa proteção interna.", "Alças reforçadas."]
  },
  {
    slug: "bolsa-julia",
    name: "Bolsa Julia",
    category: "Bolsa",
    oldPrice: "",
    price: "R$165,00",
    badge: "",
    image: "./assets/bolsa-julia.webp",
    gallery: ["./assets/bolsa-julia.webp"],
    colors: [{ label: "Única", value: "#111111", image: "./assets/bolsa-julia.webp" }],
    description: "Bolsa de ombro com visual casual e funcional.",
    details: ["Modelo amplo.", "Material resistente.", "Ideal para rotina."]
  },
  {
    slug: "bolsa-academia",
    name: "Bolsa Academia",
    category: "Bolsa",
    oldPrice: "",
    price: "R$180,00",
    badge: "",
    image: "./assets/bolsa-academia.webp",
    gallery: ["./assets/bolsa-academia.webp"],
    colors: [{ label: "Única", value: "#111111", image: "./assets/bolsa-academia.webp" }],
    description: "Bolsa para academia, viagens curtas e uso esportivo.",
    details: ["Espaço para roupas e acessórios.", "Alça longa.", "Fechamento com zíper."]
  },
  {
    slug: "bolsa-maria",
    name: "Bolsa Maria",
    category: "Bolsa",
    oldPrice: "",
    price: "R$165,00",
    badge: "",
    image: "./assets/bolsa-maria.webp",
    gallery: ["./assets/bolsa-maria.webp"],
    colors: [{ label: "Única", value: "#111111", image: "./assets/bolsa-maria.webp" }],
    description: "Modelo Maria Bolsas para uso diário com acabamento resistente.",
    details: ["Nylon impermeável.", "Design limpo.", "Boa organização."]
  },
  {
    slug: "necessaire-plastificada-f1prb",
    name: "Necessaire Plastificada",
    category: "Acessórios",
    oldPrice: "",
    price: "R$45,00",
    badge: "",
    image: "./assets/necessaire-plastificada.webp",
    gallery: ["./assets/necessaire-plastificada.webp"],
    colors: [{ label: "Estampas", value: "#d8c8b4", image: "./assets/necessaire-plastificada.webp" }],
    description: "Necessaire plastificada resistente e fácil de limpar.",
    details: ["Ideal para organização.", "Material prático.", "Opções estampadas."]
  },
  {
    slug: "necessaire-1h9v6",
    name: "Nécessaire",
    category: "Acessórios",
    oldPrice: "",
    price: "R$45,00",
    badge: "",
    image: "./assets/necessaire.webp",
    gallery: ["./assets/necessaire.webp"],
    colors: [{ label: "Única", value: "#111111", image: "./assets/necessaire.webp" }],
    description: "Nécessaire para carregar pequenos itens no dia a dia.",
    details: ["Compacta.", "Leve.", "Fácil de transportar."]
  }
];

const moneyNumber = (value) => Number(String(value).replace(/[^\d,]/g, "").replace(",", ".")) || 0;
const formatMoney = (value) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
let cartProductSlug = null;

function getProductFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("p") || "bolsa-juliana";
  return products.find((product) => product.slug === slug) || products[0];
}

function productUrl(slug) {
  return `./produto.html?p=${encodeURIComponent(slug)}`;
}

function productCard(product) {
  return `
    <article class="product-card">
      <a href="${productUrl(product.slug)}">
        <img src="${product.image}" alt="${product.name}" loading="lazy" decoding="async">
        ${product.badge ? `<span class="discount">${product.badge}</span>` : ""}
      </a>
      <h2><a href="${productUrl(product.slug)}">${product.name}</a></h2>
      <p>${product.oldPrice ? `<span class="old-price">${product.oldPrice}</span>` : ""}<strong>${product.price}</strong></p>
      <a class="card-cta" href="${productUrl(product.slug)}">Ver produto</a>
    </article>
  `;
}

function renderHomeProducts() {
  const target = document.querySelector("[data-home-products]");
  if (!target) return;
  target.innerHTML = products.filter((product) => product.slug !== "bolsa-juliana").slice(0, 6).map(productCard).join("");
}

function renderFeaturedJuliana() {
  const target = document.querySelector("[data-featured-juliana]");
  if (!target) return;
  const product = products.find((item) => item.slug === "bolsa-juliana");
  if (!product) return;
  target.innerHTML = `
    <div class="featured-copy">
      <h1>${product.displayName || product.name}</h1>
      <p>${product.pitch}</p>
      <ul class="benefit-pills">
        ${product.homeBenefits.map((benefit) => `<li>${benefit}</li>`).join("")}
      </ul>
      <div class="featured-actions">
        <a class="btn-primary" href="${productUrl(product.slug)}">Ver detalhes</a>
        <a class="btn-secondary" href="./checkout.html?p=${product.slug}">Comprar agora</a>
      </div>
    </div>
    <a class="featured-media" href="${productUrl(product.slug)}" aria-label="Ver Bolsa Juliana">
      <img src="./assets/bolsa-juliana-preta.webp" alt="${product.name}" loading="lazy" decoding="async">
    </a>
  `;
}

function renderProductsPage() {
  const target = document.querySelector("[data-products-grid]");
  const counter = document.querySelector("[data-products-count]");
  if (!target) return;
  target.innerHTML = products.map(productCard).join("");
  if (counter) counter.textContent = `${products.length} produtos encontrados`;
}

function renderProductPage() {
  const root = document.querySelector("[data-product-page]");
  if (!root) return;
  const product = getProductFromUrl();
  document.title = `${product.name} - Maria Bolsas`;
  const isJuliana = product.slug === "bolsa-juliana";
  const title = product.displayName || product.name;
  const benefitLead = product.benefitLead || product.description;
  const trustItems = product.trust || ["Pagamento seguro", "Troca facilitada", "Envio para todo o Brasil"];
  root.innerHTML = `
    <section class="gallery-area" aria-label="Galeria do produto">
      ${product.badge ? `<span class="sale-flag">${product.badge}</span>` : ""}
      ${product.gallery.map((src, index) => `<img id="${index === 0 ? "mainProductImage" : ""}" class="large-product-photo" src="${src}" alt="${product.name}" ${index === 0 ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"'}>`).join("")}
    </section>
    <aside class="product-info-sticky">
      <a class="breadcrumb" href="./index.html">Início</a>
      <span class="product-category">${product.category}</span>
      <h1>${title}</h1>
      <p class="product-benefit">${benefitLead}</p>
      <div class="price-line">
        ${product.oldPrice ? `<span class="old-price">${product.oldPrice}</span>` : ""}
        <strong>${product.price}</strong>
      </div>
      <div class="variant">
        <span>cor</span>
        <strong class="selected-color-label" data-selected-color>Cor selecionada: ${product.colors[0]?.label || "Única"}</strong>
        <div class="thumbs">
          ${product.colors.map((color, index) => `<button class="thumb ${index === 0 ? "active" : ""} ${color.available === false ? "is-unavailable" : ""}" style="--swatch:${color.value}" onclick="trocarProduto('${color.image}', this)" aria-label="${color.label}" title="${color.available === false ? color.label + " indisponível no site" : color.label}" data-color-label="${color.label}" data-color-available="${color.available === false ? "false" : "true"}"><span class="sr-only">${color.label}</span></button>`).join("")}
        </div>
        <div class="color-unavailable-box hidden" data-color-unavailable-box>
          <strong data-color-unavailable-title>Cor indisponível no site</strong>
          <p data-color-unavailable-text>Essa cor pode não estar disponível para compra direta pelo site. Fale com a loja para consultar disponibilidade.</p>
          <a data-color-unavailable-whatsapp href="#" target="_blank" rel="noreferrer">Consultar no WhatsApp</a>
        </div>
      </div>
      <div class="product-actions">
        <a class="buy-btn buy-now" href="./checkout.html?p=${product.slug}">Comprar agora</a>
        <button class="buy-btn add-cart" onclick="adicionarCarrinho('${product.slug}')">Adicionar ao carrinho</button>
      </div>
      ${isJuliana ? `
        <div class="trust-block" aria-label="Confiança de compra">
          ${trustItems.map((item) => `<div><strong>${item}</strong><span>${trustText(item)}</span></div>`).join("")}
        </div>
      ` : ""}
      <details class="product-detail" open>
        <summary>Meios de pagamento</summary>
        <div class="payments compact"><span>VISA</span><span>Master</span><span>Pix</span><span>Boleto</span></div>
      </details>
      <details class="product-detail" open>
        <summary>Meio de envio</summary>
        <div class="single-shipping-note" aria-label="Envio pelos Correios">
          <strong>Envio pelos Correios</strong>
          <span>Entrega pelos Correios para todo o Brasil.</span>
        </div>
        <form class="cep-row">
          <input type="text" placeholder="Seu CEP" aria-label="CEP">
          <a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" rel="noreferrer">Não sei meu CEP</a>
        </form>
      </details>
      <section class="description">
        <h2>Detalhes do produto:</h2>
        <p><strong>${product.name}</strong></p>
        <p>${product.description}</p>
        <h3>Características:</h3>
        <ul>${product.details.map((detail) => `<li>${detail}</li>`).join("")}</ul>
      </section>
    </aside>
  `;

  const stickyName = document.querySelector("[data-sticky-buy-name]");
  const stickyPrice = document.querySelector("[data-sticky-buy-price]");
  const stickyCta = document.querySelector("[data-sticky-buy-cta]");

  if (stickyName && stickyPrice && stickyCta) {
    stickyName.textContent = title;
    stickyPrice.textContent = product.price;
    stickyCta.href = `./checkout.html?p=${product.slug}`;
  }
}

function initStickyBuyBarFooterGuard() {
  const stickyBar = document.querySelector("[data-sticky-buy-bar]");
  const footer = document.querySelector(".mb-footer-premium");
  if (!stickyBar || !footer || !("IntersectionObserver" in window)) return;
  if (stickyBar.dataset.footerGuardBound === "true") return;
  stickyBar.dataset.footerGuardBound = "true";

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      stickyBar.classList.toggle("mb-sticky-buy-bar--hidden", entry.isIntersecting);
    });
  });

  observer.observe(footer);
}

function trustText(item) {
  const texts = {
    "Pagamento seguro": "Compra protegida com informações claras antes da finalização.",
    "Troca facilitada": "Política de troca destacada antes da compra.",
    "Envio para todo o Brasil": "Envio pelos Correios com informações claras antes da finalização."
  };
  return texts[item] || "Informação visível antes da decisão de compra.";
}

function cartItemMarkup(product) {
  return `
    <div class="cart-product">
      <img class="cart-thumb" src="${product.image}" alt="${product.name}" loading="lazy" decoding="async">
      <div>
        <strong>${product.name}</strong>
        <p>Cor: padrão</p>
        <div class="qty"><button type="button">-</button><span>1</span><button type="button">+</button></div>
      </div>
      <strong>${product.price}</strong>
    </div>
  `;
}

function updateCartDrawer(product) {
  const drawer = document.getElementById("cartDrawer");
  if (!drawer) return;
  if (!product) {
    drawer.querySelector("[data-cart-content]").innerHTML = `
      <p class="empty">O seu carrinho está vazio.</p>
      <a class="continue" href="./produtos.html">Continuar comprando</a>
    `;
    return;
  }
  const total = product.price;
  drawer.querySelector("[data-cart-content]").innerHTML = `
    ${cartItemMarkup(product)}
    <div class="cart-total"><span>Total</span><strong>${total}</strong></div>
    <a class="continue" href="./checkout.html?p=${product.slug}">Iniciar compra</a>
    <a class="more" href="./produtos.html">Ver mais produtos</a>
  `;
}

function abrirCarrinho() {
  const product = products.find((item) => item.slug === cartProductSlug);
  updateCartDrawer(product);
  document.getElementById("cartDrawer")?.classList.add("open");
  document.getElementById("overlay")?.classList.add("open");
}

function fecharCarrinho() {
  document.getElementById("cartDrawer")?.classList.remove("open");
  document.getElementById("overlay")?.classList.remove("open");
}

function adicionarCarrinho(slug = "bolsa-juliana") {
  const product = products.find((item) => item.slug === slug) || products[0];
  cartProductSlug = product.slug;
  const count = document.getElementById("cartCount");
  if (count) count.textContent = "1";
  updateCartDrawer(product);
  abrirCarrinho();
}

function trocarProduto(src, selectedThumb) {
  const mainImage = document.getElementById("mainProductImage");
  const selectedColor = document.querySelector("[data-selected-color]");
  const unavailableBox = document.querySelector("[data-color-unavailable-box]");
  const unavailableTitle = document.querySelector("[data-color-unavailable-title]");
  const unavailableText = document.querySelector("[data-color-unavailable-text]");
  const unavailableWhatsapp = document.querySelector("[data-color-unavailable-whatsapp]");

  document.querySelectorAll(".thumb").forEach((thumb) => thumb.classList.remove("active"));

  if (!selectedThumb) return;

  selectedThumb.classList.add("active");

  const colorName = selectedThumb.getAttribute("data-color-label") || selectedThumb.getAttribute("aria-label") || "";
  const isAvailable = selectedThumb.getAttribute("data-color-available") !== "false";

  if (isAvailable) {
    if (mainImage) mainImage.src = src;

    if (selectedColor && colorName) {
      selectedColor.textContent = `Cor selecionada: ${colorName}`;
    }

    if (unavailableBox) {
      unavailableBox.classList.add("hidden");
    }

    return;
  }

  if (selectedColor && colorName) {
    selectedColor.textContent = `Cor selecionada: ${colorName} — indisponível no site`;
  }

  if (unavailableBox) {
    unavailableBox.classList.remove("hidden");
  }

  if (unavailableTitle) {
    unavailableTitle.textContent = `${colorName} indisponível no site`;
  }

  if (unavailableText) {
    unavailableText.textContent = "Essa cor não está disponível para compra direta pelo site no momento. Fale com a loja para consultar se há disponibilidade no atendimento.";
  }

  if (unavailableWhatsapp) {
    const productTitle = document.querySelector(".product-info-sticky h1")?.textContent?.trim() || "Bolsa Juliana Grande em Nylon Impermeável";
    const message = `Olá! Vi no site a ${productTitle} na cor ${colorName}, mas ela aparece como indisponível. Vocês têm essa cor disponível na loja ou conseguem me ajudar?`;
    unavailableWhatsapp.href = `https://wa.me/5524988065147?text=${encodeURIComponent(message)}`;
  }
}

function renderStandaloneCart() {
  const target = document.querySelector("[data-cart-page]");
  if (!target) return;
  const params = new URLSearchParams(window.location.search);
  const product = products.find((item) => item.slug === params.get("p")) || products[0];
  target.innerHTML = `
    <div class="cart-head">
      <h1>Carrinho de compras</h1>
      <a href="./produtos.html">Continuar comprando</a>
    </div>
    <div class="cart-item">
      <img src="${product.image}" alt="${product.name}" loading="lazy" decoding="async">
      <div>
        <h2>${product.name}</h2>
        <p>Cor: padrão</p>
        <div class="qty"><button type="button">-</button><span>1</span><button type="button">+</button></div>
      </div>
      <strong>${product.price}</strong>
    </div>
    <div class="cart-line"><span>Subtotal</span><strong>${product.price}</strong></div>
    <div class="cart-line"><span>Entrega</span><strong>Envio pelos Correios</strong></div>
    <div class="cart-total"><span>Total</span><strong>${product.price}</strong></div>
    <a class="continue" href="./checkout.html?p=${product.slug}">Iniciar compra</a>
    <a class="more" href="${productUrl(product.slug)}">Ver detalhes do produto</a>
  `;
}

let checkoutState = null;

function renderCheckout() {
  const target = document.querySelector("[data-checkout-product]");
  if (!target) return;
  const params = new URLSearchParams(window.location.search);
  const product = products.find((item) => item.slug === params.get("p")) || products[0];
  const subtotal = moneyNumber(product.price);
  const shipping = 15.59;
  const shippingLabel = "Envio pelos Correios";
  const total = subtotal + shipping;
  checkoutState = { product, subtotal, shipping, total };
  target.innerHTML = `
    <div class="summary-product">
      <img src="${product.image}" alt="${product.name}" loading="lazy" decoding="async">
      <div>
        <strong>${product.name}</strong>
        <span>1 unidade</span>
      </div>
    </div>
    <div class="cart-line"><span>Subtotal</span><strong>${formatMoney(subtotal)}</strong></div>
    <div class="cart-line"><span>Frete — ${shippingLabel}</span><strong>${formatMoney(shipping)}</strong></div>
    <div class="cart-total"><span>Total</span><strong>${formatMoney(total)}</strong></div>
  `;
  document.querySelector("[data-checkout-total]").textContent = formatMoney(total);

  const backLink = document.querySelector("[data-checkout-back-product]");
  if (backLink) {
    const slugFromUrl = params.get("p");
    if (slugFromUrl) {
      backLink.href = `./produto.html?p=${encodeURIComponent(slugFromUrl)}`;
    } else {
      backLink.href = "./produtos.html";
      backLink.addEventListener("click", function (event) {
        if (window.history.length > 1) {
          event.preventDefault();
          window.history.back();
        }
      });
    }
  }
}

function mostrarFretes(event) {
  event.preventDefault();
  const form = document.querySelector(".checkout-form");
  const shipping = document.getElementById("shippingOptions");
  if (form && shipping) {
    form.style.display = "none";
    shipping.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function voltarParaDados(event) {
  if (event) event.preventDefault();
  const form = document.querySelector(".checkout-form");
  const shipping = document.getElementById("shippingOptions");
  if (form && shipping) {
    shipping.classList.add("hidden");
    form.style.display = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

const CHECKOUT_API_URL =
  window.MB_CHECKOUT_API_URL ||
  ((window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:3033/criar-preferencia"
    : "/api/criar-preferencia");

function setCheckoutStatus(message, isError) {
  const status = document.querySelector("[data-checkout-status]");
  if (!status) return;
  status.textContent = message || "";
  status.classList.toggle("hidden", !message);
  status.classList.toggle("checkout-status-error", Boolean(isError));
}

async function finalizarCompra(event) {
  if (event) event.preventDefault();
  if (!checkoutState) return;

  if (window.location.hostname === "imperialvolt.com") {
    const { product, total } = checkoutState;
    const mensagem = encodeURIComponent(
      "Olá! Vi a prévia do site Maria Bolsas e quero finalizar a compra do produto: " +
      (product.displayName || product.name) +
      " | Total aproximado: " +
      formatMoney(total) +
      "."
    );

    setCheckoutStatus("Prévia publicada: o pagamento Mercado Pago será ativado no domínio oficial. Redirecionando para o WhatsApp...", false);

    window.setTimeout(function () {
      window.location.href = "https://wa.me/5524988065147?text=" + mensagem;
    }, 900);

    return;
  }
const button = event ? event.currentTarget : document.querySelector(".checkout-finish");
  const { product, subtotal, shipping } = checkoutState;
  const textoOriginal = button ? button.textContent : "";

  setCheckoutStatus("Processando pagamento...", false);
  if (button) {
    button.disabled = true;
    button.textContent = "Processando...";
  }

  try {
    const resposta = await fetch(CHECKOUT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itens: [
          { titulo: product.displayName || product.name, preco: subtotal, quantidade: 1 },
          { titulo: "Frete - Envio pelos Correios", preco: shipping, quantidade: 1 }
        ]
      })
    });

    const dados = await resposta.json();
    if (!resposta.ok || !dados.init_point) {
      throw new Error(dados.erro || "Não foi possível iniciar o pagamento. Tente novamente.");
    }

    window.location.href = dados.init_point;
  } catch (erro) {
    setCheckoutStatus(erro.message || "Não foi possível iniciar o pagamento. Tente novamente.", true);
    if (button) {
      button.disabled = false;
      button.textContent = textoOriginal || "Finalizar compra";
    }
  }
}

window.abrirCarrinho = abrirCarrinho;
window.fecharCarrinho = fecharCarrinho;
window.adicionarCarrinho = adicionarCarrinho;
window.trocarProduto = trocarProduto;
window.mostrarFretes = mostrarFretes;
window.voltarParaDados = voltarParaDados;
window.finalizarCompra = finalizarCompra;

renderHomeProducts();
renderFeaturedJuliana();
renderProductsPage();
renderProductPage();
initStickyBuyBarFooterGuard();
renderStandaloneCart();
renderCheckout();
updateCartDrawer(null);
