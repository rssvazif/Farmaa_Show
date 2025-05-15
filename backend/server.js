const express = require('express');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const connectDB = require('./config/configDB')
const {Form,User} = require('./models/different-schema');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, '..')))

app.use(express.json())
app.use(cors())


require('dotenv').config();
const secretkey = process.env.JWT_SECRET
if(!secretkey){
    throw new Error('error in secret key!!')
}

//

app.use(session({
    secret: process.env.Session_Secret,
    resave: false,
    saveUninitialized: false,
  }));

app.use(passport.initialize());
app.use(passport.session());

connectDB();

//

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  }, async (accessToken, refreshToken, profile, done) => {
    const email = profile.emails[0].value;
    let user = await User.findOne({ email });
  
    if (!user) {
      user = new User({
        username: profile.displayName,
        email: email,
        password: 'google',
      });
      await user.save();
    }
  
    return done(null, user);
}));

passport.serializeUser((user, done) => {
    done(null, user._id);
  });
  passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
  });

//

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,"../frontend/index.html"))
})

app.get('/sign_up',(req,res)=>{
    res.sendFile(path.join(__dirname,'..','frontend','sign_up.html'))
})

app.get('/my_form',(req,res)=>{
    res.sendFile(path.join(__dirname,'..','frontend','my_form.html'))
})

app.get('/form_creator',(req,res)=>{
    res.sendFile(path.join(__dirname,'..','frontend','form_creator.html'))
})




app.get('/api/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );
  
app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/sign_up' }),
    (req, res) => {
      const token = jwt.sign({
        userId: req.user._id,
        username: req.user.username
      }, secretkey, { expiresIn: '2h' });
  
      res.redirect(`/auth/success?token=${token}&username=${req.user.username}`);
    }
  );
  
app.get('/auth/success', (req, res) => {
    const { token, username } = req.query;
    res.send(`
      <script>
        localStorage.setItem('token', '${token}');
        localStorage.setItem('username', '${username}');
        window.location.replace('/my_form');
      </script>
    `);
});


//form data

app.post('/api/form', async (req,res)=>{
    try{

        const authHeader = req.headers.authorization
        const token = authHeader && authHeader.split(' ')[1]
        if(!token){
            return res.status(401).json({message: 'لطفا ابتدا وارد حساب کاربری خود شوید'})
        }
        const decoded = jwt.verify(token,secretkey)
        const userId = decoded.userId

        const {name,sub_name,fields} = req.body
        const existingUser = await User.findById(userId)
        if(!existingUser){
            return res.status(400).json({message: 'کاربر مورد نظر وجود ندارد'})
        }
        const newForm = new Form({
          name,
          sub_name,
          fields,
          user : userId
        })
        await newForm.save()
        res.status(201).json({
          message: 'فرم با موفقیت ذخیره شد',
          name
        })
        console.log('فرم با موفقیت ذخیره شد.')
    }catch(error){
        console.log(error)
        res.status(500).json({message: 'خطا در ذخیره سازی',
            error: error.message
        })
        console.log(error.message)
    }
})

app.put('/api/form/:id',async (req,res)=>{
  try{
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]
    if(!token){
      return res.status(401).json({message:'لطفا ابتدا وارد حساب کاربری خود شوید.'})
    }

    const decoded = jwt.verify(token,secretkey)
    const userId = decoded.userId

    const {name,sub_name,fields} = req.body

    const formId = req.params.id

    if(!formId){
      return res.status(400).json({ message: 'شناسه فرم ارسال نشده است.' })
    }
    const form = await Form.findOne({_id: formId, user: userId})
    if(!form){
      return res.status(404).json({message:'فرم مورد نظر یافت نشد یا مربوط به کاربر نیست'})
    }

    form.name = name
    form.sub_name = sub_name
    form.fields = fields
    await form.save()
    res.status(200).json({message:'فرم با موفقیت به روزرسانی شد'})

  }catch(error){
    console.log(error)
    res.status(500).json({message:'خطا در ویرایش فرم',
      error: error.message
    })
  }
  
})

app.get('/api/form', async (req,res)=>{
    try{
        const authHeader = req.headers.authorization
        const token = authHeader && authHeader.split(' ')[1]
        if(!token){
            return res.status(401).json({message: 'لطفا ابتدا وارد حساب کاربری خود شوید'})
        }
        const decoded = jwt.verify(token,secretkey)
        const userId = decoded.userId

        const forms = await Form.find({user: userId})
        res.status(200).json(forms)
    }catch(error){
        console.log(error);
        res.status(500).json({message: 'خطا در دریافت فرم ها',
            error: error.message
        })
    }
})

app.delete('/api/form/:id',async(req,res)=>{
  try{
      const authHeader = req.headers.authorization
      const token = authHeader && authHeader.split(' ')[1]
      if (!token) {
        return res.status(401).json({ message: 'لطفا ابتدا وارد حساب کاربری شوید.' })
      }

      const decoded = jwt.verify(token, secretkey)
      const userId = decoded.userId

      const formId = req.params.id


      const form = await Form.findOne({ _id: formId, user: userId })

      if (!form) {
        return res.status(404).json({ message: 'فرم پیدا نشد یا متعلق به شما نیست.' })
      }

      await Form.deleteOne({ _id: formId })

      res.status(200).json({ message: 'فرم با موفقیت حذف شد.' })
  }catch(error){
    console.log(error);
    res.status(500).json({message:'خطا در حذف فرم', error: error.message})
  }
})

app.put('/api/form/:id',async(req,res)=>{
    try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'توکن احراز هویت پیدا نشد' });
    }

    const decoded = jwt.verify(token, secretkey);
    const userId = decoded.userId;

    const formId = req.params.id;
    const { name } = req.body;

    
    const form = await Form.findOne({ _id: formId, user: userId });
    if (!form) {
      return res.status(404).json({ message: 'فرم یافت نشد یا متعلق به شما نیست' });
    }

    
    form.name = name;
    await form.save();

    res.status(200).json({ message: 'نام فرم با موفقیت تغییر کرد', form });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطا در تغییر نام فرم', error: error.message });
 
  }
})

app.get('/api/editForm/:id',async(req,res)=>{
  try{
    const authHeader = req.headers.authorization
    const token = req.headers.authorization?.split(' ')[1]
    if(!token){
      return res.status(401).json({message: 'لطفا ابتدا وارد حساب کاربری خود شوید'})
    }

    const decoded = jwt.verify(token,secretkey)
    const userId = decoded.userId
    const formId = req.params.id
    const form = await Form.findOne({_id: formId, user: userId})
    if(!form){
      return res.status(404).json({message: 'فرم پیدا نشد یا متعلق به شما نیست'})
    }
    res.status(200).json(form)
    }catch(error){
      console.log(error);
      res.status(500).json({message: 'خطا در دریافت فرم', error: error.message})
    }
  
})


app.post('/api/userData', async (req,res)=>{
    const {username,email,password} = req.body
  try{
        const existingUser = await User.findOne({email})
        if(existingUser){
            return res.status(400).json({error: 'the user signed up in past...'})
        }

        const newUser = new User({username,email,password})
        await newUser.save()

        const token = jwt.sign(
            {userId: newUser._id,username: newUser.username},
            secretkey,
            {expiresIn: '2h'}
        )
        res.status(201).json({
            message: 'اطلاعات کاربر ذخیره شد',
            token,
            username: newUser.username
        })
        console.log('اطلاعات کاربر ذخیره شد')
    }catch(error){
        console.log(error);
        res.status(500).json({message:'کاربر قبلا ثبت نام کرده است',
            error: error.message
        })
        console.log(error.message);
    }
})

app.post('/api/login',async (req,res)=>{
    const {email,password} = req.body
    try{
        const user = await User.findOne({email})
        if(!user|| user.password !== password){
            return res.status(401).json({message: 'ایمیل یا رمز عبور اشتباه است'})        
        }

        const token = jwt.sign({userId:user._id , username: user.username},secretkey,{expiresIn:'2h'})

        res.status(200).json({
            message : 'کاربر وارد شد',
            token,
            username:user.username
        })
    }catch(error){
        console.log(error);
        res.status(500).json({ message: 'خطای سرور', error: error.message })
    }
})



app.listen(port,()=>{
    console.log('tha server is running...');
})