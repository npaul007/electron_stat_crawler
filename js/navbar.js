
let updateSelectedPage = function () {
    let aTag = this.querySelector('a');
    
    // initially removing active status from tabs
    aTag.closest('ul').querySelectorAll('li').forEach(li => {
        li.querySelector('a').classList.remove('active');
    });

    // initially hiding all pages
    document.querySelectorAll('.full-page').forEach(page => {
        page.style.display = "none";
    });
    
    // adding active style to appropriate tab
    aTag.classList.add("active");
    // showing appropriate page
    document.querySelector(`div[name="${aTag.attributes.name.value}-page"]`).style.display = "block";
}

let addNavbarEventListeners = function () {
   let links = document.querySelectorAll("a[name]");
   links.forEach(link => {
       link.parentElement.addEventListener("click",updateSelectedPage);
   });

   window.addEventListener("keydown",function (e) {
       // tab switching logic
        if( e.ctrlKey && e.keyCode === 9 ) {
            let nextTab = document.querySelector('.active').parentElement.nextElementSibling;
            if( nextTab === null ) {
                nextTab = document.querySelector('.nav-link');
            }
            nextTab.click();
        }
   });

   document.querySelector('span[name="print-button" ]').addEventListener("click",() => {
        window.print();
   });
}

window.navbar = {
    addNavbarEventListeners:addNavbarEventListeners
}