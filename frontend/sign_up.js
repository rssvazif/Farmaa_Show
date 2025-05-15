
const {createApp} = Vue

createApp({
    data(){
        return{
            userData: {
                username: '',
                email: '',
                password: ''
            },
            tuggle_signUp_past : false,
            oldUser:{
                email : '',
                password : ''
            }
        }
    },
    methods:{

        async sendUser(e){
            e.preventDefault()
            try{
                const response = await fetch('/api/userData',{
                    method: 'POST',
                    headers:{
                        'Content-type':'application/json'
                    },
                    body: JSON.stringify(this.userData)
                })

                if(!response.ok){
                    throw new Error('کاربر قبلا ثبت نام کرده است ')
                }
                const result = await response.json()
                
                localStorage.setItem('token',result.token)
                localStorage.setItem('username', result.username)

                window.location.replace('/my_form')
            }catch(error){
                console.log(error);
                alert('خطا در ثبت اطلاعات')
            }
        },

        async loginUser(e){
            e.preventDefault()

            try{
                const response = await fetch('/api/login',{
                    method: 'POST',
                    headers: {
                        'Content-type':'application/json'
                    },
                    body: JSON.stringify(this.oldUser)
                })
    
                if(! response.ok){
                    throw new Error('ورود ناموفق')
                }
    
                const result = await response.json()
    
                localStorage.setItem('token', result.token)
                localStorage.setItem('username',result.username)
    
                window.location.replace('/my_form')

            }catch(error){
                console.log(error);
                alert('ایمیل یا رمز عبور اشتباه است')
            }
            
        },

        showFunction(){
            this.tuggle_signUp_past = true
        }

    }
}).mount('#sign-up')
