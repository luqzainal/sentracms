import dotenv from 'dotenv';

dotenv.config();

async function testS3UploadDirect() {
  console.log('🧪 Testing S3 Upload Directly...\n');

  try {
    // 1. Get pre-signed URL from API
    console.log('📋 Step 1: Getting pre-signed URL...');
    const response = await fetch('http://localhost:3000/api/generate-upload-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: 'test-direct-upload.jpg',
        fileType: 'image/jpeg',
      }),
    });

    if (!response.ok) {
      throw new Error(`API failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Pre-signed URL generated:');
    console.log('   - Upload URL length:', data.uploadUrl?.length || 0);
    console.log('   - Public URL:', data.publicUrl);
    console.log('   - File name:', data.fileName);

    // 2. Create test file content
    console.log('\n📋 Step 2: Creating test file...');
    const testContent = 'This is a test file for direct S3 upload';
    const testFile = new Blob([testContent], { type: 'image/jpeg' });
    
    console.log('   - File size:', testFile.size, 'bytes');
    console.log('   - File type:', testFile.type);

    // 3. Upload to S3 using pre-signed URL
    console.log('\n📋 Step 3: Uploading to S3...');
    console.log('   - Using pre-signed URL...');
    
    const uploadResponse = await fetch(data.uploadUrl, {
      method: 'PUT',
      body: testFile,
      headers: {
        'Content-Type': 'image/jpeg',
      },
    });

    console.log('📡 Upload Response:');
    console.log('   - Status:', uploadResponse.status);
    console.log('   - Status Text:', uploadResponse.statusText);
    console.log('   - Headers:', Object.fromEntries(uploadResponse.headers.entries()));

    if (uploadResponse.ok) {
      console.log('✅ S3 upload successful!');
      
      // 4. Test accessing the uploaded file
      console.log('\n📋 Step 4: Testing file access...');
      try {
        const fileResponse = await fetch(data.publicUrl);
        console.log('   - File access status:', fileResponse.status);
        
        if (fileResponse.ok) {
          const fileContent = await fileResponse.text();
          console.log('   - File content length:', fileContent.length);
          console.log('   - File accessible: ✅');
        } else {
          console.log('   - File not accessible: ❌');
          console.log('   - This might be a bucket policy issue');
        }
      } catch (error) {
        console.log('   - Error accessing file:', error.message);
      }
    } else {
      console.log('❌ S3 upload failed!');
      const errorText = await uploadResponse.text();
      console.log('   - Error response:', errorText);
      
      // Parse XML error response
      if (errorText.includes('<?xml')) {
        const errorMatch = errorText.match(/<Code>(.*?)<\/Code>/);
        const messageMatch = errorText.match(/<Message>(.*?)<\/Message>/);
        
        if (errorMatch) {
          console.log('   - Error code:', errorMatch[1]);
        }
        if (messageMatch) {
          console.log('   - Error message:', messageMatch[1]);
        }
      }
    }

    // 5. Test with different file types
    console.log('\n📋 Step 5: Testing different file types...');
    const testCases = [
      { name: 'text.txt', type: 'text/plain', content: 'Hello World' },
      { name: 'image.png', type: 'image/png', content: 'PNG test' },
      { name: 'document.pdf', type: 'application/pdf', content: 'PDF test' }
    ];

    for (const testCase of testCases) {
      console.log(`   Testing ${testCase.name}...`);
      
      try {
        // Get new pre-signed URL
        const urlResponse = await fetch('http://localhost:3000/api/generate-upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: testCase.name,
            fileType: testCase.type,
          }),
        });
        
        if (urlResponse.ok) {
          const urlData = await urlResponse.json();
          const testBlob = new Blob([testCase.content], { type: testCase.type });
          
          const testUploadResponse = await fetch(urlData.uploadUrl, {
            method: 'PUT',
            body: testBlob,
            headers: { 'Content-Type': testCase.type },
          });
          
          console.log(`     - ${testCase.name}: ${testUploadResponse.ok ? '✅' : '❌'} (${testUploadResponse.status})`);
        }
      } catch (error) {
        console.log(`     - ${testCase.name}: ❌ (${error.message})`);
      }
    }

    console.log('\n🎯 Test Summary:');
    console.log('   If uploads work: S3 permissions are correct');
    console.log('   If uploads fail: Check bucket policy and IAM permissions');
    console.log('   If API fails: Check development server');

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testS3UploadDirect(); 