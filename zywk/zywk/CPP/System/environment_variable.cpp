#include <node.h>
#include <v8.h>
#include <iostream>
#include <fstream>

namespace demo {

	

	using v8::FunctionCallbackInfo;
	using v8::Isolate;
	using v8::Local;
	using v8::Object;
	using v8::String;
	using v8::Value;
	using v8::Number;
	//查看日制是否是debug模式
	void isDebug(const FunctionCallbackInfo<Value>& args)
	{
		Isolate* isolate = args.GetIsolate();
		try {
			//检测传入参数个数
			if (args.Length() != 1 || !args[0]->IsNumber())
			{
				if (args.Length() != 1)
					throw std::string("The function IsDebug parms err , require only 1\n");
				else
					throw std::string("The function IsDebug parms err , require a number\n");

			}
			else {
				int values = args[0]->NumberValue();
				if (values == 1)
					std::cout << "The pattern is Debug ...\n";
				else
					std::cout << "The pattern is Release ...\n";
				args.GetReturnValue().Set(values);
			}
		}
		catch (std::string errMsg) {
			std::cout << errMsg << std::endl;
		}
	}

	void init(Local<Object> exports)
	{
		NODE_SET_METHOD(exports, "IsDebug", isDebug);
	}

	NODE_MODULE(NODE_GYP_MODULE_NAME, init)

}  // namespace demo