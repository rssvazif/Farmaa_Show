const {createApp} = Vue 

createApp({
    data(){
        return{
            username: '',
            status: true,
            hamburgerTuggle: false
        }
    },
    methods:{
        getUsername(){
            const user = localStorage.getItem('username')
            if(user){
                this.status = false
                this.username =  user
            }else{
                this.status = true
            }
        }
    },
    mounted(){
        this.getUsername()

        window.addEventListener('pageshow', (event) => {
            if (event.persisted) {
                this.getUsername();
            }
        });
    }
}).mount('#main')