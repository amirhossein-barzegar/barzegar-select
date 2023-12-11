# افزونه Barzegar Select

به سادگی ورودی (input) ها را بسیار جذاب برای کاربران جلوه دهید. فیلد های چند انتخابی (select option) زیبا و کاربردی برای کاربران ایجاد کنید به طوری کامل از دکمه های صفحه کلید کاربر پشتیبانی نماید.

- [نحوه نصب و راه اندازی](#نحوه-نصب-و-راه-اندازی)
- [قابلیت ها و امکانات](#قابلیت-ها-و-امکانات)
- [نحوه استفاده](#نحوه-استفاده)

## نحوه نصب و راه اندازی

مراحل نصب کاملا ساده است.
<br>
با توجه به اینکه این کتابخانه نیازمند به کتابخانه jquery است. بنابراین ابتدا مطمئن شوید که به خوبی فایل جاوااسکریپت آن را پیش از همه بارگزاری نمایید. 

```html
<script src="https://code.jquery.com/jquery-3.7.0.min.js"></script>
```

پس آن ، باید فایل جاوااسکریپت و استایل کتابخانه barzegar-select را تهیه کرده و در زیر آن بارگیری نمایید.

```html
<link href="https://cdn.jsdelivr.net/npm/barzegar-select@0.0.9/src/barzegar.select.jquery.css" rel="stylesheet"/>

<script src="https://cdn.jsdelivr.net/npm/barzegar-select@0.0.9/src/barzegar.select.jquery.min.js"></script>
```


## قابلیت ها و امکانات
- امکان برچسب نویسی ، تگ گذاری و اضافه و حذف کردن آنها
- امکان قرار دادن داده هایی برای نمایش و انتخاب کردن در لیست کشویی
- امکان جستجو در میان آیتم های موجود در لیست کشویی
- پشتیبانی بینظیر و کامل از صفحه کلید برای راحتی کاربران و امکان جابه جایی ، افزودن و حذف آیتم ها با استفاده از صفحه کلید! ( حتی میتوان با Ctrl+A همه را انتخاب کرده و با دکمه Backspace یا Delete آنها را حذف کرد.)
- امکان دریافت مستقیم داده ها از وبسرویس مشخص و ارسال مقادیر مورد نیاز به آن به ساده ترین شکل ممکن

## نحوه استفاده

ابتدا المان input خود را در سند HTML خود ایجاد نمایید و یک آیدی مشخص به آن بدهید.
```html
<input type="text" id="inputId" />
```

سپس از طریق آیدی input خود ، آنرا در jquery انتخاب کرده و آنرا از طریق متد barzegarSelect() آن را به پلاگین BarzegarSelect متصل کنید.
```js
$("#inputId").barzegarSelect({
    // change options here
})
```

## امکانات

Option                  | Type                      | Default                  | Info
----------------------- | ------------------------- |:------------------------:| -----------------------------------------------------------
minChars                | <sub>Int</sub>            | `1`                      | حداقل تعداد کاراکتر برای شروع جستجو از وب سرویس 
minLengthToCreate       | <sub>Int</sub>            | `1`                      | حداقل تعداد کاراکتر برای افزودن به انتخاب شده ها
maxLengthToCreate       | <sub>Int</sub>            | `30`                     | حداکثر تعداد کاراکتر برای افزودن به انتخاب شده ها
propertyKey             | <sub>String</sub>         | `"id"`                   | نام کلید هر آیتم
propertyValue           | <sub>String</sub>         | `"name"`                 | نام مقدار هر آیتم
propertyToSelect        | <sub>String</sub>         | `"select"`               | نام کلید انتخاب شدن یا نشدن هر آیتم
propertyToReadOnly        | <sub>String</sub>         | `"readonly"`             | نام کلید فقط خواندنی بودن یا نبودن هر آیتم
createItem              | <sub>Boolean</sub>        | `true`                   | امکان افزودن آیتم های جدید با تایپ و ثبت کردن
liveConnect             | <sub>Boolean</sub>        | `false`                  | اتصال مستقیم به وب سرویس و دریافت اطلاعات از آن
dropdownLimit           | <sub>Int</sub>            | `3`                      | محدود کردن تعداد نمایش در لیست کشویی
selectedLimit           | <sub>Int</sub>            | `5`                      | محدود کردن تعداد آیتم های انتخاب شده
setToHiddenInput        | <sub>Boolean</sub>        | `true`                   | قرار دادن مقادیر به یک input مخفی
dropdownGap             | <sub>Int</sub>            | `1`                      | فاصله لیست کشویی از خودِ input
webserviceUrl           | <sub>String</sub>         | `""`                     | آدرس وب سرویس اتصالی برای دریافت داده های مورد جستجو
method                  | <sub>String</sub>         | `"POST"`                 | متد HTTP وب سرویس
contentType             | <sub>String</sub>         | `"application/x-www-form-urlencoded:charset=UTF-8"`| نوع فرمت ارسالی داده ها به وبسرویس
customData              | <sub>Object</sub>         | `{}`                     | دیگر پارامتر های ارسالی دلخواه به وب سرویس
delay                   | <sub>Int</sub>            | `100`                    | تاخیر در دریافت نتایج از وبسرویس
searchingText           | <sub>String</sub>         | `"در حال جستجو ..."`                      | متن عبارت درحال جستجو از وب سرویس
addBtnText              | <sub>String</sub>         | `"افزودن"`               | متن دکمه افزودن
deleteIcon              | <sub>String</sub>         | `"<svg></svg>"`                  | آیکون دکمه حذف موارد انتخاب شده
hasImg                  | <sub>Boolean</sub>        | `true`                   | امکان نمایش آیتم همراه با عکس
propertyImg             | <sub>String</sub>         | `"img"`                  | نام کلید خصوصیت عکس
