const savedFoodsRouter = require('./routes/savedFoods');

// Routes
app.use('/api/auth', authRouter);
app.use('/api/workouts', workoutsRouter);
app.use('/api/nutrition', nutritionRouter);
app.use('/api/saved-foods', savedFoodsRouter); 