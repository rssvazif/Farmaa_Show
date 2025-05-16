

const {createApp} = Vue

createApp({
  data(){
      return{
        tuggle_user : false,
        tuggle_setting : null,
        act: 'overlay',
        rename_box: false,
        selected: '',
        new_name: '',
        index: '',
        forms: null,
        edit_index: '',
        sure_delete: false,
        sure_name: false,
        formToDelete: null,
        new_name: '',
        searchInput: ''
    }


    },
    methods:{

        async getForms(){
          const token = localStorage.getItem('token')
          if(!token){
            window.location.href = '/sign_up.html'
            return
          }
          try{
            const response = await fetch('/api/form',{
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          })

          if(!response.ok){
            throw new Error('خطا در دریافت فرم ها')
          }
          const data = await response.json()
          this.forms = data
          }catch(error){
            console.log(error)
            alert('خطا در دریافت فرم ها')
          }
          
        },

        async deleteForm(){
          const token = localStorage.getItem('token')
            if(!token){
              window.location.href = '/sign_up.html'
              return
            }
          try{
            const response = await fetch(`/api/form/${this.formToDelete}`,{
              method: 'DELETE',
              headers:{
                'Authorization':`Bearer ${token}`
              }
            })
            
            if(!response.ok){
              const errorText = await response.text()
              console.log(errorText);
              throw new Error('خذف فرم ناموفق بود')
            }

            this.forms = this.forms.filter(form => form._id !== this.formToDelete)
            this.sure_delete = false
            this.formToDelete = null
            
          }catch(error){
            const errorText = await response.text()
            console.log(errorText);
            console.log(error);
            alert('خطا در حذف فرم')
          }
        },

        async renameForm(formId){
          const token = localStorage.getItem('token')
          if(!token){
            window.location.href = '/sign_up.html'
            return
          }

          try{
            const response = await fetch(`/api/form/${formId}`,{
              method: 'PUT',
              headers:{ 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              name: this.new_name
            })
          })

          if(!response.ok){
            const errorText = await response.text()
            console.log(errorText);
            throw new Error('خطا در تغییر نام فرم')
          }
          const result = await response.json()
          // const updatedForm = result.form

          // const index = this.forms.findIndex(form => form._id === updatedForm._id)
          // if(index !== -1){
          //   this.forms[index].name = updatedForm.name
          //  this.filteredForms[index].name = updatedForm.name
          //}
		//this.forms[this.index_form].name = this.new_name
         	const index = this.forms.findIndex(form => form._id === formId);
		if (index !== -1) {
		    this.forms[index].name = this.new_name;
		}
          this.new_name = ''
          this.sure_name = false

          }catch(error){
            console.log(error);
            alert('خطا در تغییر نام فرم')
          }
        },

      logoutUser(){
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        window.location.href = '/'
      },
      


      show_user_menu(){
        this.tuggle_user= ! this.tuggle_user
      },

      show_setting_menu(index){
        if(this.tuggle_setting === index){
          this.tuggle_setting = null
        }else{
          this.tuggle_setting = index
        }
      },

      checked(data){
        this.selected = data;
      },

      saveIndex(index){
        this.edit_index = index
      },
      confirmDelete(id){
        this.formToDelete = id
        this.sure_delete = true
      },

      confirmRename(id){
        this.sure_name = true
      },
      goToForm(id){
        localStorage.setItem('formId', id)
        window.location.href = '/form_creator.html'
      },
      searchForms(){
        this.forms = this.forms.filter(form =>
          form.name.toLowerCase().includes(this.searchInput.toLowerCase())
        )
        if(this.searchInput === ''){
          this.getForms()
        }
      },
      checkFormId(){
        const formId = localStorage.getItem('formId')
        if(formId){
          localStorage.removeItem('formId')
        }
      }

    },
    mounted(){
      const formId = localStorage.getItem('formId')
      if(formId){
        localStorage.removeItem('formId')
      }
      const token = localStorage.getItem('token')
      if(!token){
        window.location.href = '/sign_up.html'
      }
      this.getForms()
    }
}).mount('#main-box')

