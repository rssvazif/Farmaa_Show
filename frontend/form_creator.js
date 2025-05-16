
const {createApp} = Vue 

createApp({
    data(){
        return{
            data_draged: '',
            dropText: true,
            fields: [],
            fields_simple:[
                {
                    title: 'شماره تلفن',
                    value : '',
                    type : 'tel' 
                },
                {
                    title : 'ایمیل',
                    value : '',
                    type : 'email' 
                },
                {
                    title : 'متن',
                    value : '',
                    type : 'text' 
                }
            ],
            fields_office:[
                {
                    title : 'عنوان',
                    value : '',
                    type : 'title' 
                },
                {
                    title : 'تاریخ',
                    value : {
                        calander : '',
                        time : ''
                    },
                    type : 'date' 
                },
                {
                    title : 'متن',
                    value : '',
                    type : 'text' 
                },
                {
                    title : 'اطلاعات هویتی',
                    value : {
                        fname : '',
                        lname : '',
                        age : '',
                        national_code : ''
                    },
                    type : 'info' 
                },
                {
                    title : 'امضا',
                    value : '',
                    type : 'signeture'
                }
            ],
            FormName: 'فرم',
            sub_FormName: '',
            isEdit: false,
            edit_index: null,
            temp1 : true,
            temp2 : false,
            temp3 : false,
            apiUrl : false
        }        
    },
    methods:{


        async sendData(){

            let activeFields = []

            if(this.temp1){
                activeFields = this.fields
            }else if(this.temp2){
                activeFields = this.fields_office
            }else{
                activeFields = this.fields_simple
            }

            const token = localStorage.getItem('token')
            if(!token){
                alert('لطفا ابتدا وارد حساب کاربری خود شوید')
                return
            }

            const formData = {
                name : this.FormName,
                sub_name : this.sub_FormName,
                fields : activeFields
            }

            const id = localStorage.getItem('formId')
            if(this.apiUrl && id){
                var serverUrl = `/api/form/${id}`
                localStorage.removeItem('formId')
            }else{
                var serverUrl = '/api/form'
            }
            
            try{
                const response = await fetch(serverUrl,{
                    method: this.apiUrl?'PUT': 'POST',
                    headers: {
                        'Content-type':'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                });
                if(!response.ok){
                    throw new Error('خطا در ارسال فرم به سرور')
                }

                const result = await response.json()

                this.apiUrl = false
                localStorage.removeItem('formId')

                window.location.href = '/my_form.html'
                alert('فرم با موفقیت ذخیره شد')

                
            }catch(error){
                console.log('error:',error);
                alert('ارسال فرم به سرور با مشکل مواجه شد!')
            }
        },

        ondrag(event,value){
            this.data_draged = value
        },
        ondragover(event){
            event.preventDefault()
        },

        createFildObject(title,type){
            const base = {
                title : title, 
                type : type
            }

            switch(type){
                case 'address':
                    base.value = {
                        province : '',
                        city : '',
                        street : '',
                        number : '',
                        unit : ''
                    }
                    break
                case 'date':
                    base.value = {
                        calander : '',
                        time :''
                    }
                    break
                case 'info':
                    base.value = {
                        fname : '',
                        lname : '',
                        age : '',
                        national_code : ''
                    }
                    break
                default:
                    base.value = ''
            }
            return base
        },

        async loadFormData(formId){
            const token = localStorage.getItem('token')
            if(!token){
                window.location.href = '/sign_up.html'
                return
            }

            try{
                const response = await fetch(`/api/editForm/${formId}`,{
                    method: 'GET',
                    headers:{
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
                if(!response.ok){
                    throw new Error('خطا در دریافت اطلاعات فرم')
                }

                const result = await response.json()
                this.FormName = result.name
                this.sub_FormName = result.sub_name
                this.fields = result.fields

                this.dropText = false

            }catch(error){
                console.log(error);
                alert('خطا در دریافت اطلاعات فرم')      
            }
        },

        ondrop(event){
            event.preventDefault()
            if(this.data_draged){
                const typeMap = {
                    'عنوان': 'title',
                    'اطلاعات هویتی': 'info',
                    'تاریخ': 'date',
                    'شماره تلفن': 'tel',
                    'ایمیل': 'email',
                    'متن': 'text',
                    'آدرس': 'address',
                    'فایل': 'file',
                    'امضا': 'signeture'
                }

                const type = typeMap[this.data_draged]
                const newField = this.createFildObject(this.data_draged,type)

                if(this.temp1){
                    this.fields.push(newField)
                }else if(this.temp2){
                    this.fields_office.push(newField)
                }else{
                    this.fields_simple.push(newField)
                }

                this.data_draged = ''
                this.dropText = false

            }
                
        },
        isEditing(){
            this.isEdit = true
        },
        edit_item(index){
            this.edit_index = index
        },
        handleClose(event){
            if(!event.target.closest('.form-items')){
                this.edit_index = null
            }
            if(!event.target.closest('.main-sub')){
                this.isEdit = false
            }
        },
        deleteItem(temp,index){
            if(temp === 'temp1'){
                this.fields.splice(index,1)
                if(this.fields.length === 0 ) this.dropText = true
            }else if(temp === 'temp2'){
                this.fields_office.splice(index,1)
                if(this.fields_office.length === 0 ) this.dropText = true
            }else{
                this.fields_simple.splice(index,1)
                if(this.fields_simple.length === 0 ) this.dropText = true
            }
        },
        template(type){
            switch(type){
                case 'scratch':
                    this.temp1 = true
                    this.temp2 = false
                    this.temp3 = false
                    this.dropText = true
                    this.edit_index = null
                    break
                case 'office':
                    this.temp1 = false
                    this.temp2 = true
                    this.temp3 = false
                    this.dropText = false
                    this.edit_index = null
                    break
                default:
                    this.temp1 = false
                    this.temp2 = false
                    this.temp3 = true
                    this.dropText = false
                    this.edit_index = null

            }
        },
        print(){
            window.print()
        }

    },
    mounted(){

        const token = localStorage.getItem('token')
        if(!token){
            window.location.href = '/'
            return
        }
        const formId = localStorage.getItem('formId')
        if(formId){
            this.apiUrl = true
            this.loadFormData(formId)
        }

    }
}).mount('#total-page')
