class E extends HTMLElement{
    connectedCallback(){
        this['attachShadow']({mode:'open'}).innerHTML = "Hello World";
    }
}