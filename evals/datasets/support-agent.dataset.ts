export const supportAgentDataset: {
  id: string;
  input: {
    question: string;
  };
  expectedOutput: string;
  metadata: {
    caseId: string;
    documentIds: string[];
    expectedChunkIds: string[];
  };
}[] = [
  {
    id: 'order-processing-days',
    input: {
      question:
        'რა დღეებში ხდება შეკვეთების დამუშავება თქვენს ონლაინ მაღაზიაში?',
    },
    expectedOutput:
      'ჩვენი ონლაინ მაღაზია შეკვეთებს ამუშავებს სამუშაო დღეებში, ორშაბათიდან პარასკევის ჩათვლით.',
    metadata: {
      caseId: 'order-processing-days',
      documentIds: ['8d6f5be0-4851-4dba-9b41-ffef10098b84'],
      expectedChunkIds: ['c9bdeede-a415-40c6-8fd5-26fa7dedc373'],
    },
  },

  {
    id: 'pending-order-over-5-days',
    input: {
      question:
        'რა ხდება, თუ შეკვეთა 5 სამუშაო დღეზე მეტხანს რჩება PENDING სტატუსში?',
    },
    expectedOutput:
      'თუ შეკვეთა 5 სამუშაო დღეზე მეტხანს რჩება PENDING სტატუსში, support-ის თანამშრომელმა უნდა გადაამოწმოს შეკვეთის მდგომარეობა და საჭიროების შემთხვევაში გადასცეს საკითხი ლოჯისტიკის გუნდს.',
    metadata: {
      caseId: 'pending-order-over-5-days',
      documentIds: ['8d6f5be0-4851-4dba-9b41-ffef10098b84'],
      expectedChunkIds: ['e2a7cea5-08ae-4575-8f46-a21a4ed253e4'],
    },
  },

  {
    id: 'tbilisi-delivery-time',
    input: {
      question: 'რა ვადაში ხდება თბილისში სტანდარტული მიწოდება?',
    },
    expectedOutput: 'თბილისში სტანდარტული მიწოდების ვადაა 1-3 სამუშაო დღე.',
    metadata: {
      caseId: 'tbilisi-delivery-time',
      documentIds: ['8d6f5be0-4851-4dba-9b41-ffef10098b84'],
      expectedChunkIds: ['38c93329-1be0-47c7-ba61-0c8b44bc9e5b'],
    },
  },

  {
    id: 'delivery-max-time-exceeded',
    input: {
      question:
        'რა ხდება, თუ მიწოდების მაქსიმალური სავარაუდო ვადა უკვე გასულია?',
    },
    expectedOutput:
      'თუ მიწოდების მაქსიმალური სავარაუდო ვადა უკვე გასულია, მომხმარებელს უნდა ეცნობოს, რომ შეკვეთა დაგვიანებულია.',
    metadata: {
      caseId: 'delivery-max-time-exceeded',
      documentIds: ['8d6f5be0-4851-4dba-9b41-ffef10098b84'],
      expectedChunkIds: ['de670a05-bc21-4e16-b1ff-a915528605ab'],
    },
  },

  {
    id: 'delivery-working-days-calculation',
    input: {
      question:
        'როგორ ხდება მიწოდების ვადის გამოთვლა და რა დღეები არ ითვლება სამუშაო დღეებად?',
    },
    expectedOutput:
      'მიწოდების ვადა ითვლება შეკვეთის დამუშავების მომენტიდან და არა კალენდარული დღეებით. შაბათი, კვირა და ოფიციალური დასვენების დღეები სტანდარტულ სამუშაო დღეებად არ ითვლება.',
    metadata: {
      caseId: 'delivery-working-days-calculation',
      documentIds: ['8d6f5be0-4851-4dba-9b41-ffef10098b84'],
      expectedChunkIds: ['d825be74-13f2-4de7-a237-2de779c1bc54'],
    },
  },

  {
    id: 'product-not-working-on-arrival',
    input: {
      question:
        'რა უნდა გააკეთოს support-ის თანამშრომელმა, თუ მომხმარებელი აცხადებს, რომ პროდუქტი მიღებისთანავე არ მუშაობდა?',
    },
    expectedOutput:
      'თუ მომხმარებელი აცხადებს, რომ პროდუქტი მიღებისთანავე არ მუშაობდა, support-ის თანამშრომელმა უნდა დააფიქსიროს პროდუქტის დასახელება, შეკვეთის ნომერი ან მომხმარებლის იდენტიფიცირებისთვის საჭირო სხვა მონაცემი და პრობლემის აღწერა.',
    metadata: {
      caseId: 'product-not-working-on-arrival',
      documentIds: ['4c3c848a-fb64-4c68-8b9a-38cc5d587998'],
      expectedChunkIds: ['00715fc6-2275-4e5d-baf0-d2c7097d86fe'],
    },
  },

  {
    id: 'delivered-order-cancellation',
    input: {
      question:
        'რა უნდა გააკეთოს support-ის თანამშრომელმა, თუ მომხმარებელი ითხოვს შეკვეთის გაუქმებას, მაგრამ შეკვეთას უკვე აქვს DELIVERED სტატუსი?',
    },
    expectedOutput:
      'თუ შეკვეთას უკვე აქვს DELIVERED სტატუსი, ჩვეულებრივი გაუქმება აღარ გამოიყენება. ასეთ შემთხვევაში მომხმარებლის მოთხოვნა უნდა განიხილებოდეს როგორც დაბრუნების ან refund-ის მოთხოვნა.',
    metadata: {
      caseId: 'delivered-order-cancellation',
      documentIds: ['a39b5d7e-02a7-4357-b0f9-21e257fff4c7'],
      expectedChunkIds: ['2844d449-c2c7-40c6-9e62-6cdf1e585b0b'],
    },
  },

  {
    id: 'pending-order-cancellation',
    input: {
      question:
        'რა უნდა გააკეთოს support-ის თანამშრომელმა, თუ მომხმარებელი ითხოვს შეკვეთის გაუქმებას, მაგრამ შეკვეთას აქვს PENDING სტატუსი?',
    },
    expectedOutput:
      'თუ შეკვეთას აქვს PENDING სტატუსი, გაუქმების მოთხოვნა შეიძლება დამუშავდეს ჩვეულებრივი წესით. შეკვეთის გაუქმების შემდეგ მისი სტატუსი იცვლება CANCELLED-ზე.',
    metadata: {
      caseId: 'pending-order-cancellation',
      documentIds: ['a39b5d7e-02a7-4357-b0f9-21e257fff4c7'],
      expectedChunkIds: ['2844d449-c2c7-40c6-9e62-6cdf1e585b0b'],
    },
  },

  {
    id: 'refund-without-refunded-status',
    input: {
      question:
        'რა უნდა გააკეთოს support-ის თანამშრომელმა, თუ მომხმარებელი ითხოვს თანხის დაბრუნებას, მაგრამ შეკვეთას ჯერ არ აქვს REFUNDED სტატუსი?',
    },
    expectedOutput:
      'Support-ის თანამშრომელმა არ უნდა უთხრას მომხმარებელს, რომ refund უკვე შესრულებულია მხოლოდ მოთხოვნის შექმნის საფუძველზე. ამის თქმა შეიძლება მხოლოდ მაშინ, როდესაც შეკვეთის სტატუსი ან შესაბამისი სისტემური მონაცემი ადასტურებს თანხის დაბრუნებას.',
    metadata: {
      caseId: 'refund-without-refunded-status',
      documentIds: ['a39b5d7e-02a7-4357-b0f9-21e257fff4c7'],
      expectedChunkIds: ['0af1c450-b3cf-4bf8-82e3-af3767a564a2'],
    },
  },

  {
    id: 'water-damaged-product-warranty',
    input: {
      question:
        'რა უნდა გააკეთოს support-ის თანამშრომელმა, თუ მომხმარებელი აცხადებს, რომ პროდუქტი დაზიანდა წყლით?',
    },
    expectedOutput:
      'თუ პროდუქტი დაზიანდა მომხმარებლის მიერ, მაგალითად წყლით დაზიანების შედეგად, ეს ავტომატურად არ ითვლება საგარანტიო შემთხვევად.',
    metadata: {
      caseId: 'water-damaged-product-warranty',
      documentIds: ['4c3c848a-fb64-4c68-8b9a-38cc5d587998'],
      expectedChunkIds: ['6a5bd659-e7ae-4fd9-a340-12caf1be4859'],
    },
  },

  {
    id: 'missing-exact-delivery-date',
    input: {
      question:
        'რა უნდა გააკეთოს support-ის თანამშრომელმა, თუ მომხმარებელი ითხოვს ზუსტ მიწოდების თარიღს, მაგრამ ასეთი ინფორმაცია არ არსებობს?',
    },
    expectedOutput:
      'Support-მა არ უნდა დაჰპირდეს მომხმარებელს ზუსტი მიწოდების თარიღი, თუ ასეთი ინფორმაცია შეკვეთის ან ლოჯისტიკური სისტემის მონაცემებში არ არსებობს.',
    metadata: {
      caseId: 'missing-exact-delivery-date',
      documentIds: ['8d6f5be0-4851-4dba-9b41-ffef10098b84'],
      expectedChunkIds: ['10e1dd01-130d-4d08-8a0d-bf34fcd22601'],
    },
  },

  {
    id: 'missing-warranty-period',
    input: {
      question:
        'რა უნდა გააკეთოს support-ის თანამშრომელმა, თუ მომხმარებელი ითხოვს კონკრეტულ საგარანტიო ვადას, მაგრამ ასეთი ინფორმაცია არ არსებობს?',
    },
    expectedOutput:
      'Support-ის თანამშრომელმა არ უნდა გამოიგონოს კონკრეტული საგარანტიო ვადა, თუ ასეთი ინფორმაცია knowledge base-ში ან პროდუქტის მონაცემებში არ არსებობს.',
    metadata: {
      caseId: 'missing-warranty-period',
      documentIds: ['4c3c848a-fb64-4c68-8b9a-38cc5d587998'],
      expectedChunkIds: ['0bc58837-5fb5-40d4-a965-123dea1a3473'],
    },
  },
];
