// article-template.js - Funcionalidades específicas para artigos

document.addEventListener('DOMContentLoaded', function() {
    // Botão "Voltar ao Topo" específico para artigos
    const backToTopArticle = document.getElementById('back-to-top-article');
    
    if (backToTopArticle) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopArticle.style.display = 'flex';
                backToTopArticle.classList.add('visible');
            } else {
                backToTopArticle.style.display = 'none';
                backToTopArticle.classList.remove('visible');
            }
        });
        
        backToTopArticle.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Formulário de newsletter
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input[type="email"]').value;
            
            // Simulação de envio
            alert(`Obrigado por se inscrever! Você receberá nossos artigos no email: ${email}`);
            newsletterForm.reset();
        });
    }
    
    // Destaque para parágrafos ao passar o mouse
    const articleParagraphs = document.querySelectorAll('.article-body p');
    articleParagraphs.forEach(p => {
        p.addEventListener('mouseenter', () => {
            p.style.backgroundColor = 'rgba(37, 99, 235, 0.03)';
        });
        
        p.addEventListener('mouseleave', () => {
            p.style.backgroundColor = 'transparent';
        });
    });
    
    // Atualizar tempo de leitura dinamicamente
    function updateReadingTime() {
        const articleText = document.querySelector('.article-body').innerText;
        const wordCount = articleText.split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200); // 200 palavras por minuto
        
        const readingTimeElement = document.querySelector('.meta-item:nth-child(2)');
        if (readingTimeElement && readingTime > 0) {
            readingTimeElement.innerHTML = `<i class="far fa-clock"></i> ${readingTime} min de leitura`;
        }
    }
    
    // Executar quando a página carregar
    updateReadingTime();
});
